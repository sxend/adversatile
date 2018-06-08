import Configuration, { ViewModelConf } from "./Configuration";
import { RandomId } from "./misc/RandomId";
import { Action } from "./Action";
import { Store } from "./Store";
import { ElementModel } from "./ElementModel";
import { IElementData } from "../../generated-src/protobuf/messages";

export class ViewModel {
  constructor(
    private config: ViewModelConf,
    private store: Store,
    private action: Action
  ) {
    this.polling();
  }
  private initNewElements(elements: ElementModel[]): void {
    Promise.all(elements.map(el => el.requestData()))
      .then(reqs => this.action.fetchElementsData(reqs))
      .catch(console.error);
  }
  private polling(): void {
    const poller = () => {
      try {
        this.pollElements();
      } catch (e) {
        console.error(e);
      }
      setTimeout(poller, this.config.polling.interval);
    };
    setTimeout(poller);
  }
  private pollElements(): void {
    const newElements = [].slice
      .call(document.querySelectorAll(this.selector()))
      .map((element: HTMLElement) => {
        element.classList.add(this.config.markedClass);
        return new ElementModel(element, this.config.em, this.store);
      });
    if (newElements.length !== 0) {
      this.initNewElements(newElements);
    }
  }
  private selector(): string {
    const selector = this.config.selector;
    const markedClass = this.config.markedClass;
    return `${selector}:not(.${markedClass})`;
  }
}
