import Configuration from "./Configuration";
import { RandomId } from "./misc/RandomId";
import { Action } from "./Action";
import { Store } from "./Store";
import { ElementModel } from "./ElementModel";
import { IElementData } from "../../generated-src/protobuf";

export class ViewModel {
  private elements: ElementModel[] = [];
  constructor(
    private configuration: Configuration,
    private store: Store,
    private action: Action
  ) {
    this.polling();
  }
  private async registerNewElements(elements: ElementModel[]) {
    this.elements = this.elements.concat(elements);
    const reqs = await Promise.all(elements.map(async element => {
      return {
        id: element.id,
        assets: await element.requestAssets().catch(console.error)
      };
    }));
    this.action.fetchElementsData(reqs);
  }

  private findElement(id: string): ElementModel | undefined {
    return this.elements.find(el => el.id === id);
  }
  private polling() {
    const poller = () => {
      try {
        const elements: ElementModel[] = this.findNewElements();
        if (elements.length > 0) {
          this.registerNewElements(elements);
        }
      } catch (e) {
        console.error(e);
      }
      setTimeout(poller, this.configuration.vm.polling.interval);
    };
    setTimeout(poller);
  }
  private findNewElements(): ElementModel[] {
    return [].slice
      .call(document.querySelectorAll(this.selector()))
      .map((element: HTMLElement) => {
        this.markElement(element);
        return this.createNewElement(element);
      });
  }
  private createNewElement(rawElement: HTMLElement): ElementModel {
    return new ElementModel(rawElement, this.configuration, this.store);
  }
  private markElement(element: HTMLElement): void {
    element.classList.add(this.configuration.vm.markedClass);
  }
  private selector(): string {
    const selector = this.configuration.vm.selector;
    const markedClass = this.configuration.vm.markedClass;
    return `${selector}:not(.${markedClass})`;
  }
}
