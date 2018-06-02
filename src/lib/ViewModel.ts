import Configuration from "./Configuration";

class ViewModel {
  constructor(configuration: Configuration) {
    const self = this;
    function select() {
      const elements: HTMLElement[] = [].slice.call(document.querySelectorAll(`${configuration.selector}:not(.${configuration.markedClass})`));
      elements.forEach(el => {
        el.classList.add(configuration.markedClass);
      });
      if (elements.length > 0) {
        self.register(elements);
      }
    }
    setTimeout(function selector() {
      select();
      setTimeout(selector, configuration.polling.interval);
    }, configuration.polling.interval);
  }
  private elements: HTMLElement[] = [];
  private newElements(elements: HTMLElement[]) {
    elements.forEach(el => console.log(el));
  }
  register(elements: HTMLElement[]) {
    this.newElements(elements);
    this.elements = this.elements.concat(elements);
  }
}
export default ViewModel;
