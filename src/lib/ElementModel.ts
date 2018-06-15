import Configuration, {
  ElementOption,
  ElementModelConf,
  AssetOption
} from "./Configuration";
import { RandomId } from "./misc/RandomId";
import { EventEmitter } from "events";
import { firstDefined, uniq, uniqBy } from "./misc/ObjectUtils";
import { Store } from "./Store";
import { TemplateOps } from "./TemplateOps";
import { MacroOps, MacroProps, MacroContext } from "./MacroOps";
import { Dom } from "./misc/Dom";
import { Tracking } from "./misc/Tracking";
import { OpenRTB } from "./openrtb/OpenRTB";
import { AssetUtils, OpenRTBUtils } from "./openrtb/OpenRTBUtils";

export class ElementModel extends EventEmitter {
  private renderer: Renderer;
  private _excludedBidders: string[] = [];
  private isRendered: boolean = false;
  private detectedAssets: AssetOption[] = [];
  constructor(
    private element: HTMLElement,
    private config: ElementModelConf,
    private store: Store,
    private props: {}
  ) {
    super();
    this.renderer = new Renderer(this.config, this);
    if (!this.name) {
      element.setAttribute(this.config.nameAttributeName, RandomId.gen());
    }
  }
  init(): ElementModel {
    if (this.option.preRender) {
      this.once("rendered", () => {
        this.emit("init");
      }).update(OpenRTBUtils.dummyBid());
    } else {
      this.emit("init");
    }
    return this;
  }
  get name(): string {
    return this.element.getAttribute(this.config.nameAttributeName);
  }
  get option(): ElementOption {
    return this.config.option(this.name);
  }
  get assets(): AssetOption[] {
    let assets: AssetOption[] = this.option.assets || [];
    return uniqBy(assets.concat(this.detectedAssets), asset => asset.id);
  }
  get excludedBidders(): string[] {
    return uniq(this.option.excludedBidders.concat(this._excludedBidders));
  }
  update(bid: OpenRTB.Bid): Promise<void> {
    const context = this.createRenderContext(bid);
    return this.renderer.render(
      this.element,
      context
    ).then(_ => {
      this.emit("rendered");
    }).catch(console.error);
  }
  private createRenderContext(bid: OpenRTB.Bid): RendererContext {
    return {
      macroContext: new MacroContext(
        this,
        this.createRenderProps(),
        bid
      )
    };
  }

  private addAssetOptions(assets: AssetOption[]) {
    this.detectedAssets = uniqBy(this.detectedAssets.concat(assets), asset => asset.id);
  }
  private createRenderProps(): MacroProps {
    return {
      addAssetOptions: (...options: AssetOption[]) => this.addAssetOptions(options)
    };
  }
}

class Renderer {
  private macroOps: MacroOps;
  private templateOps: TemplateOps;
  constructor(private config: ElementModelConf, private model: ElementModel) {
    this.macroOps = new MacroOps(this.config.macro);
    this.templateOps = new TemplateOps(
      this.config.templates,
      this.config.templateQualifierKey
    );
  }
  async render(
    element: HTMLElement,
    context: RendererContext
  ): Promise<void> {
    const template = await this.templateOps.resolveTemplate(this.model.name);
    if (template) {
      element.innerHTML = await this.macroOps.applyTemplate(template, context.macroContext);
      await this.macroOps.applyElement(element, context.macroContext);
    } else {
      console.warn("missing template", this.model.name, context);
    }
  }
}
interface RendererContext {
  macroContext: MacroContext
}
