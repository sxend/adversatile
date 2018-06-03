import Configuration from "./Configuration";
import { RandomId } from "./misc/RandomId";

export class ElementModel {
  constructor(
    private element: HTMLElement,
    private configuration: Configuration
  ) {
    element.setAttribute(this.idAttributeName, RandomId.gen());
  }
  get id() {
    return this.element.getAttribute(this.idAttributeName);
  }
  private get idAttributeName() {
    return this.configuration.vm.em.idAttributeName;
  }
  async render(data: any) {
    this.element.innerHTML = `<pre>${JSON.stringify(data, null, "  ")}</pre>`;
  }
}
