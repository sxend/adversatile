import Configuration, { ViewModelConf } from "./Configuration";
import { RandomId } from "./misc/RandomId";
import { Action } from "./Action";
import { Store } from "./Store";
import { ElementModel } from "./ElementModel";

export class ViewModel {
  constructor(
    private config: ViewModelConf,
    private store: Store,
    private action: Action
  ) {
    this.polling();
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
        return element;
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
  private initNewElements(elements: HTMLElement[]): void {
    Promise.all(elements.map(el => this.createElementModel(el)))
      .then((models: ElementModel[]) => {
        const reqs = models.map(model => model.requestData());
        this.action.fetchElementsData(reqs);
      }).catch(console.error);
  }
  private createElementModel(element: HTMLElement): Promise<ElementModel> {
    return new Promise(resolve => {
      new ElementModel(element, this.config.em, this.store, {
        onInit: (model) => resolve(model)
      });
    });
  };
}
