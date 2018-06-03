import Configuration from "./Configuration";
import { RandomId } from "./misc/RandomId";
import * as handlebars from "handlebars";
import Macro from "./Macro";
import { EventEmitter } from "events";

export class ElementModel extends EventEmitter {
  private macro: Macro;
  constructor(
    private element: HTMLElement,
    private configuration: Configuration
  ) {
    super();
    this.macro = new Macro(configuration);
    if (!this.id) {
      element.setAttribute(this.idAttributeName, RandomId.gen());
    }
  }
  get id(): string {
    return this.element.getAttribute(this.idAttributeName);
  }
  get group(): string {
    return this.element.getAttribute(this.groupAttributeName);
  }
  private get emConfig() {
    return this.configuration.vm.em;
  }
  private get idAttributeName() {
    return this.emConfig.idAttributeName;
  }
  private get groupAttributeName() {
    return this.emConfig.groupAttributeName;
  }
  private get templateQualifierKey() {
    return this.emConfig.templateQualifierKey;
  }
  async render(data: any) {
    const template = await this.resolveTemplate();
    if (template) {
      this.element.innerHTML = await this.macro.applyTemplate(template, data);
      await this.macro.applyElement(this.element, data);
    } else {
      console.warn("missing template", this.id, this.group, data);
    }
  }
  private async resolveTemplate(): Promise<string | undefined> {
    const template = [
      this.resolveExternalTemplate(this.id),
      this.resolveExternalTemplate(this.group),
      this.emConfig.templates[this.id],
      this.emConfig.templates[this.group]
    ].filter(_ => !!_)[0];
    return template;
  }
  private resolveExternalTemplate(qualifier: string): string | undefined {
    const query = `[${this.templateQualifierKey}="${qualifier}"]`;
    const templateEl = document.querySelector(query);
    if (templateEl) {
      return templateEl.innerHTML;
    }
  }
}
