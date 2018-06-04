import Configuration, { ElementOption } from "./Configuration";
import { RandomId } from "./misc/RandomId";
import * as handlebars from "handlebars";
import Macro from "./Macro";
import { EventEmitter } from "events";
import { firstDefined } from "./misc/ObjectUtils";

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
  async render(data: any): Promise<void> {
    const template = await this.resolveTemplate();
    if (template) {
      this.element.innerHTML = await this.macro.applyTemplate(template, data.payload);
      await this.macro.applyElement(this.element, data.payload);
    } else {
      console.warn("missing template", this.id, this.group, data.payload);
    }
  }
  async requestAssets(): Promise<number[]> {
    const option: ElementOption | undefined = firstDefined([
      this.emConfig.option(this.id),
      this.emConfig.option(this.group)
    ]);
    if (!option) {
      return Promise.resolve([]);
    }
    return this.detectAssets(option);
  }
  private async detectAssets(option: ElementOption) {
    let assets: number[] = option.assets || [];
    if (option.preRender) {
      await this.preRender();
      const macros = this.macro.getAppliedMacros(this.element);
      assets = assets.concat(macros.map(this.macroNameToAssetNo));
    }
    return assets;
  }
  private async preRender(): Promise<void> {
    const dummyData = {};
    await this.render(dummyData);
  }
  private async resolveTemplate(): Promise<string | undefined> {
    const template = firstDefined([
      this.resolveExternalTemplate(this.id),
      this.resolveExternalTemplate(this.group),
      this.emConfig.templates[this.id],
      this.emConfig.templates[this.group]
    ]);
    return template;
  }
  private resolveExternalTemplate(qualifier: string): string | undefined {
    const query = `[${this.templateQualifierKey}="${qualifier}"]`;
    const templateEl = document.querySelector(query);
    if (templateEl) {
      return templateEl.innerHTML;
    }
  }
  private macroNameToAssetNo(name: string): number {
    if (name === "link") {
      return 1;
    }
    return 0;
  }
}
