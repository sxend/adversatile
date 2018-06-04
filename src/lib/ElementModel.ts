import Configuration, { ElementOption } from "./Configuration";
import { RandomId } from "./misc/RandomId";
import * as handlebars from "handlebars";
import Macro from "./Macro";
import { EventEmitter } from "events";
import { firstDefined } from "./misc/ObjectUtils";

export class ElementModel extends EventEmitter {
  private macro: Macro;
  private state: any = {};
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
  async update(data: any): Promise<void> {
    this.state = data;
    const template = await this.resolveTemplate();
    if (template) {
      this.element.innerHTML = await this.macro.applyTemplate(template, data.payload);
      await this.macro.applyElement(this.element, data.payload);
    } else {
      console.warn("missing template", this.id, this.group, data.payload);
    }
  }
  async requestAssets(): Promise<number[]> {
    let assets: number[] = this.option.assets || [];
    if (this.option.preRender) {
      const old = this.state;
      await this.update(ElementModel.DummyData);
      const macros = this.macro.getAppliedMacros(this.element);
      this.update(old);
      assets = assets.concat(macros.map(this.macroNameToAssetNo));
    }
    return assets;
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
  private get option(): ElementOption {
    if (this.emConfig.hasOption(this.id)) {
      return this.emConfig.option(this.id);
    } else {
      return this.emConfig.option(this.group);
    }
  }
  private static DummyData = {
    payload: { message: "..." }
  };
  private macroNameToAssetNo(name: string): number {
    if (name === "link") {
      return 1;
    }
    return 0;
  }
}
