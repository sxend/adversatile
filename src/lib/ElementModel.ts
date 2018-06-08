import Configuration, { ElementOption, ElementModelConf } from "./Configuration";
import { RandomId } from "./misc/RandomId";
import Macro from "./Macro";
import { EventEmitter } from "events";
import { firstDefined } from "./misc/ObjectUtils";
import { Store } from "./Store";
import { IElementData } from "../../generated-src/protobuf/messages";

export class ElementModel extends EventEmitter {
  private macro: Macro;
  constructor(
    private element: HTMLElement,
    private config: ElementModelConf,
    private store: Store
  ) {
    super();
    this.macro = new Macro(this.config.macro);
    if (!this.id) {
      element.setAttribute(this.config.idAttributeName, RandomId.gen());
    }
    this.store.on(`change:${this.id}`, () => this.update(this.store.getState(this.id)));
  }
  get id(): string {
    return this.element.getAttribute(this.config.idAttributeName);
  }
  get group(): string {
    return this.element.getAttribute(this.config.groupAttributeName);
  }
  private async update(state: IElementData): Promise<void> {
    const template = await this.resolveTemplate();
    if (template) {
      this.element.innerHTML = await this.macro.applyTemplate(template, state);
      await this.macro.applyElement(this.element, state);
    } else {
      console.warn("missing template", this.id, this.group, state);
    }
  }
  async requestData(): Promise<{ id: string, assets: number[] }> {
    const assets = await this.requestAssets();
    return {
      id: this.id,
      assets
    };
  }
  private async requestAssets(): Promise<number[]> {
    let assets: number[] = this.option.assets || [];
    if (this.option.preRender) {
      await this.update(ElementModel.DummyData);
      const macros = this.macro.getAppliedMacros(this.element);
      assets = assets.concat(macros.map(this.macroNameToAssetNo));
    }
    return assets;
  }
  private async resolveTemplate(): Promise<string | undefined> {
    const template = firstDefined([
      this.resolveExternalTemplate(this.id),
      this.resolveExternalTemplate(this.group),
      this.config.templates[this.id],
      this.config.templates[this.group]
    ]);
    return template;
  }
  private resolveExternalTemplate(qualifier: string): string | undefined {
    const query = `[${this.config.templateQualifierKey}="${qualifier}"]`;
    const templateEl = document.querySelector(query);
    if (templateEl) {
      return templateEl.innerHTML;
    }
  }
  private get option(): ElementOption {
    if (this.config.hasOption(this.id)) {
      return this.config.option(this.id);
    } else {
      return this.config.option(this.group);
    }
  }
  private static DummyData: IElementData = {
    message: "...",
  };
  private macroNameToAssetNo(name: string): number {
    if (name === "link") {
      return 1;
    }
    return 0;
  }
}
