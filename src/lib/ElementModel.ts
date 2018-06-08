import Configuration, { ElementOption, ElementModelConf } from "./Configuration";
import { RandomId } from "./misc/RandomId";
import Macro from "./Macro";
import { EventEmitter } from "events";
import { firstDefined } from "./misc/ObjectUtils";
import { Store } from "./Store";
import { IElementData } from "../../generated-src/protobuf/messages";

export class ElementModel extends EventEmitter {
  private macro: Macro;
  private templateResolver: TemplateResolver;
  constructor(
    private element: HTMLElement,
    private config: ElementModelConf,
    private store: Store
  ) {
    super();
    this.macro = new Macro(this.config.macro);
    this.templateResolver = new TemplateResolver(this.config.templates, this.config.templateQualifierKey);
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
    const template = await this.templateResolver.resolveTemplate(this.id, this.group);
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
class TemplateResolver {
  constructor(private templates: { [id: string]: string }, private templateQualifierKey: string) {
  }
  async resolveTemplate(...ids: string[]): Promise<string | undefined> {
    const template = firstDefined([].concat(
      ids.map(id => this.resolveExternalTemplate(id)),
      ids.map(id => this.templates[id])
    ));
    return template;
  }
  resolveExternalTemplate(qualifier: string): string | undefined {
    const query = `[${this.templateQualifierKey}="${qualifier}"]`;
    const templateEl = document.querySelector(query);
    if (templateEl) {
      return templateEl.innerHTML;
    }
  }
}