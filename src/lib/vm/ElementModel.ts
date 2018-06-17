import { ElementOption, ElementModelConf, AssetOption } from "../Configuration";
import { RandomId } from "../misc/RandomId";
import { EventEmitter } from "events";
import { OpenRTB } from "../openrtb/OpenRTB";
import { OpenRTBUtils } from "../openrtb/OpenRTBUtils";
import { Renderer, RendererContext, RenderProps } from "../vm/Renderer";
import { MacroOps } from "../vm/renderer/Macro";
import { TemplateOps } from "./renderer/Template";
import { uniqBy, uniq, onceFunction, lockableFunction } from "../misc/ObjectUtils";

export class ElementModel extends EventEmitter {
  public id: string;
  private renderer: Renderer;
  private _excludedBidders: string[] = [];
  constructor(private config: ElementModelConf, private element: HTMLElement) {
    super();
    this.id = RandomId.gen();
    const macroOps = new MacroOps(this.config.macro);
    const templateOps = new TemplateOps(
      this.config.templates,
      this.config.templateQualifierKey
    );
    this.renderer = new Renderer(this.config.renderer, macroOps, templateOps);
    if (!this.name) {
      element.setAttribute(this.config.nameAttributeName, RandomId.gen());
    }
    config.plugins.forEach(plugin => plugin.install(this));
  }
  init(): ElementModel {
    if (this.option.preRender) {
      this.preRender().then(_ => this.emit("init"));
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
    return uniqBy(this.option.assets, asset => asset.id);
  }
  get excludedBidders(): string[] {
    return uniq(this.option.excludedBidders.concat(this._excludedBidders));
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
  private createRenderContext(bid: OpenRTB.Bid): RendererContext {
    return {
      model: this,
      element: this.element,
      bid,
      props: this.createRenderProps(bid)
    };
  }
  private addAssetOptions(assets: AssetOption[]) {
    this.option.assets = uniqBy(
      this.option.assets.concat(assets),
      asset => asset.id
    );
  }
  private createRenderProps(bid: OpenRTB.Bid): RenderProps {
    return {
      render: onceFunction((context: RendererContext) => {
        this.emit("render", context);
      }),
      rendered: onceFunction((context: RendererContext) => {
        this.emit("rendered", context);
      }),
      impress: onceFunction(() => {
        this.emit("impression", bid);
      }),
      vimp: lockableFunction(onceFunction(() => {
        this.emit("viewable_impression", bid);
      })),
      viewThrough: onceFunction(() => {
        this.emit("view_through", bid);
      }),
      findAssets: (...assets: AssetOption[]) => {
        this.emit("find_assets", assets);
      }
    };
  }
}
