import Configuration, {
  ElementOption,
  ElementModelConf,
  AssetOption
} from "./Configuration";
import { RandomId } from "./misc/RandomId";
import { EventEmitter } from "events";
import { firstDefined, uniq, uniqBy } from "./misc/ObjectUtils";
import { Store } from "./Store";
import { IElementData } from "../../generated-src/protobuf/messages";
import { TemplateOps } from "./TemplateOps";
import { MacroOps, MacroProps } from "./MacroOps";
import { Dom } from "./misc/Dom";
import { Tracking } from "./misc/Tracking";

export class ElementModel {
  private renderer: Renderer;
  private _excludedBidders: string[] = [];
  constructor(
    private element: HTMLElement,
    private config: ElementModelConf,
    private store: Store,
    private props: {
      onInit: (self: ElementModel) => void;
    }
  ) {
    this.renderer = new Renderer(this.config, this);
    if (!this.name) {
      element.setAttribute(this.config.nameAttributeName, RandomId.gen());
    }
    (this.option.preRender
      ? this.update(ElementModel.DummyData)
      : Promise.resolve()
    ).then(_ => {
      this.store.on(`change:${this.name}`, () =>
        this.updateWithStore(this.name)
      );
      this.updateWithStore(this.name);
      this.props.onInit(this);
    });
  }
  get name(): string {
    return this.element.getAttribute(this.config.nameAttributeName);
  }
  get option(): ElementOption {
    return this.config.option(this.name);
  }
  get assets(): AssetOption[] {
    let assets: AssetOption[] = this.option.assets || [];
    assets = assets.concat(this.renderer.getAssets());
    return assets;
  }
  get excludedBidders(): string[] {
    return uniq(this.option.excludedBidders.concat(this._excludedBidders));
  }
  private async updateWithStore(qualifier: string) {
    if (this.store.hasElementData(qualifier)) {
      return this.update(this.store.consumeElementData(qualifier));
    }
  }
  private async update(data: IElementData): Promise<void> {
    return this.renderer.render(
      this.element,
      this.createRenderContext(data),
      this.createRenderProps()
    );
  }
  private createRenderContext(data: IElementData): RendererContext {
    return {
      data: data
    };
  }
  private createRenderProps(): RendererProps {
    return {
      onImpression: () => console.log("impression"),
      onInview: () => console.log("inview"),
      onViewThrough: () => console.log("vt"),
      onClick: () => console.log("click"),
      trackingCall: Tracking.trackingCall
    };
  }
  private static DummyData: IElementData = {
    message: "..."
  };
}

class Renderer {
  private macroOps: MacroOps;
  private templateOps: TemplateOps;
  private assets: AssetOption[] = [];
  constructor(private config: ElementModelConf, private model: ElementModel) {
    this.macroOps = new MacroOps(this.config.macro);
    this.templateOps = new TemplateOps(
      this.config.templates,
      this.config.templateQualifierKey
    );
  }
  private addAssetOptions(...assets: AssetOption[]): void {
    this.assets = uniqBy(this.assets.concat(assets), asset => asset.id);
  }
  async render(
    element: HTMLElement,
    context: RendererContext,
    props: RendererProps
  ): Promise<void> {
    this.assets = [];
    const template = await this.templateOps.resolveTemplate(this.model.name);
    if (template) {
      element.innerHTML = await this.macroOps.applyTemplate(template, context);
      await this.macroOps.applyElement(element, context, props);
    } else {
      console.warn("missing template", this.model.name, context);
    }
  }
  getAssets(): AssetOption[] {
    return this.assets;
  }
}
interface RendererContext {}
interface RendererProps extends MacroProps {}
