import Configuration from "./Configuration";
import { RandomId } from "./misc/RandomId";
import { Action } from "./Action";
import { Store } from "./Store";
import { ElementModel } from "./ElementModel";

export class ViewModel {
  private elements: ElementModel[] = [];
  constructor(
    private configuration: Configuration,
    private store: Store,
    private action: Action
  ) {
    this.store.on("new_data", (ids: string[]) => this.newData(ids));
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
    this.action.fetchData(reqs);
  }
  private newData(ids: string[]) {
    for (let id of ids) {
      const data = this.store.getData(id);
      const element = this.findElement(id);
      if (element) {
        element.render(data).catch(console.error);
      }
    }
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
        return new ElementModel(element, this.configuration);
      });
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
