import { ElementOption, ElementModelConf, AssetOption } from "./Configuration";
import { RandomId } from "./misc/RandomId";
import { EventEmitter } from "events";
import { uniq, uniqBy, resultOrElse, onceFunction } from "./misc/ObjectUtils";
import { TemplateOps } from "./TemplateOps";
import { MacroOps, MacroProps, MacroContext } from "./MacroOps";
import { OpenRTB } from "./openrtb/OpenRTB";
import { OpenRTBUtils } from "./openrtb/OpenRTBUtils";

export class ElementModel extends EventEmitter {
  private renderer: Renderer;
  private _excludedBidders: string[] = [];
  private detectedAssets: AssetOption[] = [];
  constructor(public element: HTMLElement, private config: ElementModelConf) {
    super();
    this.renderer = new Renderer(this.config, this);
    if (!this.name) {
      element.setAttribute(this.config.nameAttributeName, RandomId.gen());
    }
    this.option.plugins.forEach(plugin => plugin.install(this));
  }
  init(): ElementModel {
    if (this.option.preRender) {
      this.once("updated", () => {
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
    this.emit("update", bid);
    const context = this.createRenderContext(bid);
    return this.renderer
      .render(context)
      .then(_ => {
        this.emit("updated", bid);
      })
      .catch(console.error);
  }
  private createRenderContext(bid: OpenRTB.Bid): RendererContext {
    return {
      model: this,
      element: this.element,
      bid,
      props: this.createMacroProps(bid)
    };
  }

  private addAssetOptions(assets: AssetOption[]) {
    this.detectedAssets = uniqBy(
      this.detectedAssets.concat(assets),
      asset => asset.id
    );
  }
  private createMacroProps(bid: OpenRTB.Bid): MacroProps {
    return {
      impress: onceFunction(() => {
        this.emit("impression", bid);
      }),
      vimp: onceFunction(() => {
        this.emit("viewable_impression", bid);
      }),
      viewThrough: onceFunction(() => {
        this.emit("view_through", bid);
      }),
      addAssetOptions: (...options: AssetOption[]) =>
        this.addAssetOptions(options)
    };
  }
}

export class Renderer {
  private macroOps: MacroOps;
  private templateOps: TemplateOps;
  constructor(private config: ElementModelConf, private model: ElementModel) {
    this.macroOps = new MacroOps(this.config.macro);
    this.templateOps = new TemplateOps(
      this.config.templates,
      this.config.templateQualifierKey
    );
    model.option.renderer.plugins.forEach(plugin => plugin.install(this));
  }
  async render(context: RendererContext): Promise<void> {
    const template = (await this.templateOps.resolveTemplate(this.model.name)) ||
      resultOrElse(() => context.bid.ext.bannerHtml);
    const macroContext = new MacroContext(
      context.model,
      context.element,
      context.props,
      template,
      context.bid
    );
    await this.macroOps.applyMacro(macroContext);
  }
}
export interface RendererContext {
  model: ElementModel,
  element: HTMLElement,
  bid: OpenRTB.Bid;
  props: MacroProps;
}
