import { ElementOption, ElementModelConf, AssetOption } from "../Configuration";
import { RandomId } from "../misc/RandomId";
import { EventEmitter } from "events";
import { OpenRTB } from "../openrtb/OpenRTB";
import { OpenRTBUtils } from "../openrtb/OpenRTBUtils";
import { Renderer, RendererContext, RenderProps } from "../vm/Renderer";
import { MacroOps } from "../vm/renderer/Macro";
import { TemplateOps } from "./renderer/Template";
import { uniqBy, uniq, onceFunction, lockableFunction } from "../misc/ObjectUtils";
import { Async } from "../misc/Async";

export class ElementModel extends EventEmitter {
  private renderer: Renderer;
  private _excludedBidders: string[] = [];
  constructor(private config: ElementModelConf, private element: HTMLElement) {
    super();
    const macroOps = new MacroOps(this.config.macro);
    const templateOps = new TemplateOps(this.config);
    this.renderer = new Renderer(this.config.renderer, macroOps, templateOps);
    if (!this.id) {
      element.setAttribute(this.config.idAttributeName, RandomId.gen());
    }
    if (!this.name) {
      element.setAttribute(this.config.nameAttributeName, RandomId.gen());
    }
    config.plugins.forEach(plugin => plugin.install(this));
  }
  get id(): string {
    return this.element.getAttribute(this.config.idAttributeName);
  }
  get name(): string {
    return this.element.getAttribute(this.config.nameAttributeName);
  }
  get qualifier(): string {
    return this.element.getAttribute(this.config.qualifierAttributeName);
  }
  get group(): string {
    return this.element.getAttribute(this.config.groupAttributeName);
  }
  get useTemplate(): string {
    return this.element.getAttribute(this.config.templateUseAttr);
  }
  get option(): ElementOption {
    return this.config.option(this.name);
  }
  get assets(): AssetOption[] {
    return uniqBy(this.option.assets, asset => asset.id);
  }
  get excludedBidders(): string[] {
    return uniq(this.option.excludedBidders.concat(this._excludedBidders));
  }
  init(): ElementModel {
    Async.wait(() => this.config.hasOption(this.name), 50).then(_ => {
      if (!this.group) {
        this.element.setAttribute(this.config.groupAttributeName, this.config.defaultGroup);
      }
      if (this.option.preRender) {
        this.preRender().then(_ => this.emit("init"));
      } else {
        this.emit("init");
      }
    });
    return this;
  }
  update(bid: OpenRTB.Bid): Promise<void> {
    const context = this.createRenderContext(bid);
    this.emit("update", bid);
    return this.renderer
      .render(context)
      .then(_ => {
        this.emit("updated", bid);
      })
      .catch(console.error);
  }
  private async preRender(): Promise<void> {
    const onFindAssets = (assets: AssetOption[]) => {
      this.addAssetOptions(assets);
    };
    this.on("find_assets", onFindAssets)
      .once("updated", () => {
        this.removeListener("find_assets", onFindAssets);
      });
    await this.update(OpenRTBUtils.dummyBid());
  }
  private createRenderContext(bid: OpenRTB.Bid): RendererContext {
    return {
      model: this,
      element: this.element,
      bid,
      props: this.createRenderProps()
    };
  }
  private addAssetOptions(assets: AssetOption[]) {
    this.option.assets = uniqBy(
      this.option.assets.concat(assets),
      asset => asset.id
    );
  }
  private createRenderProps(): RenderProps {
    return {
      render: onceFunction((context: RendererContext) => {
        this.emit("render", context);
      }),
      rendered: onceFunction((context: RendererContext) => {
        this.emit("rendered", context);
      }),
      impress: onceFunction((bid: OpenRTB.Bid) => {
        this.emit("impression", bid);
      }),
      vimp: lockableFunction(onceFunction((bid: OpenRTB.Bid) => {
        this.emit("viewable_impression", bid);
      })),
      viewThrough: onceFunction((bid: OpenRTB.Bid) => {
        this.emit("view_through", bid);
      }),
      findAssets: (...assets: AssetOption[]) => {
        this.emit("find_assets", assets);
      }
    };
  }
}
