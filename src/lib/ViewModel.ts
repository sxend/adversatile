import Configuration from "./Configuration";
import { RandomId } from "./misc/RandomId";

class ViewModel {
  private elements: HTMLElement[] = [];
  constructor(private configuration: Configuration) {
    const self = this;
    setTimeout(function selector() {
      self.select();
      setTimeout(selector, configuration.vm.polling.interval);
    }, configuration.vm.polling.interval);
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
  private newElements(elements: HTMLElement[]) {
    elements.forEach(element => {
      const attrName = this.configuration.vm.idAttributeName;
      element.setAttribute(attrName, RandomId.gen());
    });
  }
  register(elements: HTMLElement[]) {
    this.newElements(elements);
    this.elements = this.elements.concat(elements);
  }
}
export default ViewModel;
