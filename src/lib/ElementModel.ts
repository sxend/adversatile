import Configuration, { ElementOption, ElementModelConf } from "./Configuration";
import { RandomId } from "./misc/RandomId";
import { EventEmitter } from "events";
import { firstDefined } from "./misc/ObjectUtils";
import { Store } from "./Store";
import { IElementData } from "../../generated-src/protobuf/messages";
import { TemplateOps } from "./TemplateOps";
import { MacroOps } from "./MacroOps";

export class ElementModel extends EventEmitter {
  private renderer: Renderer;
  constructor(
    private element: HTMLElement,
    private config: ElementModelConf,
    private store: Store,
    private props: {
      onInit: (self: ElementModel) => void
    }
  ) {
    super();
    this.renderer = new Renderer(this.config, this, {});
    if (!this.name) {
      element.setAttribute(this.config.nameAttributeName, RandomId.gen());
    }
    (this.option.preRender ? this.update(ElementModel.DummyData) : Promise.resolve()).then(_ => {
      this.store.on(`change:${this.name}`, () => this.updateWithStore(this.name));
      this.updateWithStore(this.name);
      this.props.onInit(this);
    });
  }
  get name(): string {
    return this.element.getAttribute(this.config.nameAttributeName);
  }
  private async updateWithStore(qualifier: string) {
    if (this.store.hasElementData(qualifier)) {
      return this.update(this.store.consumeElementData(qualifier));
    }
  }
  private async update(data: IElementData): Promise<void> {
    return this.renderer.render(this.element, data);
  }
  requireAssets(): number[] {
    let assets: number[] = this.option.assets || [];
    assets = assets.concat(this.renderer.getAssets());
    return assets;
  }
  private get option(): ElementOption {
    return this.config.option(this.name);
  }
  private static DummyData: IElementData = {
    message: "...",
  };
}

class Renderer {
  private macroOps: MacroOps;
  private templateOps: TemplateOps;
  private assets: number[] = [];
  constructor(private config: ElementModelConf, private model: ElementModel, private props: {}) {
    this.macroOps = new MacroOps(this.config.macro, {
      useAssets: (...assets: number[]) => this.addAssets(...assets)
    });
    this.templateOps = new TemplateOps(this.config.templates, this.config.templateQualifierKey);
  }
  private addAssets(...assets: number[]): void {
    this.assets = this.assets.concat(assets).filter((x, i, self) => self.indexOf(x) === i);
  }
  async render(element: HTMLElement, data: IElementData): Promise<void> {
    this.assets = [];
    const template = await this.templateOps.resolveTemplate(this.model.name);
    if (template) {
      element.innerHTML = await this.macroOps.applyTemplate(template, data);
      await this.macroOps.applyElement(element, data);
    } else {
      console.warn("missing template", this.model.name, data);
    }
  }
  getAssets(): number[] {
    return this.assets;
  }
}