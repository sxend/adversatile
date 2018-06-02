import Configuration from "./Configuration";
import { RandomId } from "./misc/RandomId";
import { Action } from "./Action";
import { State } from "./State";

export class ViewModel {
  private elements: HTMLElement[] = [];
  constructor(
    private configuration: Configuration,
    private state: State,
    private action: Action
  ) {
    const self = this;
    self.state.on("new_data", (ids: string[]) => self.newData(ids));
    setTimeout(function selector() {
      self.select();
      setTimeout(selector, configuration.vm.polling.interval);
    }, configuration.vm.polling.interval);
  }
  private newElements(elements: HTMLElement[]) {
    const newElementIds: string[] = [];
    elements.forEach(element => {
      const attrName = this.configuration.vm.idAttributeName;
      const id = RandomId.gen();
      newElementIds.push(id);
      element.setAttribute(attrName, id);
    });
    this.action.fetchData(newElementIds).catch(console.error);
  }
  register(elements: HTMLElement[]) {
    this.newElements(elements);
    this.elements = this.elements.concat(elements);
  }
  private newData(ids: string[]) {
    for (let id of ids) {
      const data = this.state.getData(id);
      const element = this.findElement(id);
      if (element) {
        element.innerText = JSON.stringify(data);
      }
    }
  }
  private findElement(id: string): HTMLElement {
    const idAttributeName = this.configuration.vm.idAttributeName;
    return this.elements.find(el => el.getAttribute(idAttributeName) === id);
  }
  private select() {
    try {
      const self = this;
      const selector = self.configuration.vm.selector;
      const markedClass = self.configuration.vm.markedClass;
      const elements: HTMLElement[] = [].slice.call(
        document.querySelectorAll(`${selector}:not(.${markedClass})`)
      );
      elements.forEach(el => el.classList.add(markedClass));
      if (elements.length > 0) {
        self.register(elements);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
