import { ElementOption, ElementModelConf, AssetOption } from "../Configuration";
import { RandomId } from "../misc/RandomId";
import { EventEmitter } from "events";
import { OpenRTB } from "../openrtb/OpenRTB";
import { OpenRTBUtils } from "../openrtb/OpenRTBUtils";
import { Renderer, RendererContext, RendererProps, RootRenderer } from "../vm/Renderer";
import { TemplateOps } from "./renderer/Template";
import { uniqBy, uniq, onceFunction, lockableFunction } from "../misc/ObjectUtils";
import { Async } from "../misc/Async";

export class ElementModel extends EventEmitter {
  private renderer: Renderer;
  private _excludedBidders: string[] = [];
  static create(config: ElementModelConf, element: HTMLElement): Promise<ElementModel> {
    return new ElementModel(config, element).init();
  }
  private constructor(private config: ElementModelConf, private element: HTMLElement) {
    super();
    this.renderer = new RootRenderer(this.config.renderer);
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
  async init(): Promise<ElementModel> {
    return new Promise<ElementModel>(resolve => {
      const _init = () => {
        if (!this.id) {
          this.element.setAttribute(this.config.idAttributeName, RandomId.gen());
        }
        if (!this.name) {
          this.element.setAttribute(this.config.nameAttributeName, RandomId.gen());
        }
        if (!this.group) {
          this.element.setAttribute(this.config.groupAttributeName, this.config.defaultGroup);
        }
        this.config.plugins.forEach(plugin => plugin.install(this));
        if (this.option.preRender) {
          this.preRender().then(_ => resolve(this));
        } else {
          resolve(this)
        }
      };
      if (this.config.hasOption(this.name)) {
        _init();
      } else { // for old type main execution
        Async.wait(() => this.config.hasOption(this.name), 50).then(_ => _init());
      }
    });
  }
  update(bids: OpenRTB.Bid[]): Promise<void> {
    this.emit("update", bids);
    let promise;
    if (this.option.loop) {
      promise = this.loopDisplay(bids);
    } else {
      promise = this.singleDisplay(bids);
    }
    return promise.then(_ => {
      this.emit("updated", bids);
    }).catch(console.error);
  }
  private async loopDisplay(bids: OpenRTB.Bid[]): Promise<void> {
    const context = await this.createRenderContext(bids.shift());
    return this.renderer.render(context).then(_ => {
      let loopCount = 0;
      const onExpired = (bid: OpenRTB.Bid) => {
        if (this.option.loop && loopCount++ < this.option.loopLimitCount) {
          bids.push(bid);
          this.loopDisplay(bids);
        } else {
          this.off("expired", onExpired);
        }
      };
      this.on("expired", onExpired);
    });
  }
  private async singleDisplay(bids: OpenRTB.Bid[]): Promise<void> {
    const context = await this.createRenderContext(bids.shift());
    return this.renderer.render(context).then(_ => void 0);
  }
  private async preRender(): Promise<void> {
    const onFindAssets = (assets: AssetOption[]) => {
      this.addAssetOptions(assets);
    };
    this.on("find_assets", onFindAssets)
      .once("updated", () => {
        this.removeListener("find_assets", onFindAssets);
      });
    await this.update([OpenRTBUtils.dummyBid()]);
  }
  private async createRenderContext(bid: OpenRTB.Bid): Promise<RendererContext> {
    const context = new RendererContext(
      this,
      this.element,
      this.createRenderProps(),
      bid,
    );
    const templateOps = new TemplateOps(this.config);
    context.template = await templateOps.resolveTemplate(
      this.useTemplate,
      this.qualifier,
      this.name) || "";
    return context;
  }
  private addAssetOptions(assets: AssetOption[]) {
    this.option.assets = uniqBy(
      this.option.assets.concat(assets),
      asset => asset.id
    );
  }
  private createRenderProps(): RendererProps {
    return {
      root: {
        render: onceFunction((context: RendererContext) => {
          this.emit("render", context);
        }),
        rendered: onceFunction((context: RendererContext) => {
          this.emit("rendered", context);
        })
      },
      impress: onceFunction((bid: OpenRTB.Bid) => {
        this.emit("impression", bid);
      }),
      vimp: lockableFunction(onceFunction((bid: OpenRTB.Bid) => {
        this.emit("viewable_impression", bid);
      })),
      viewThrough: onceFunction((bid: OpenRTB.Bid) => {
        this.emit("view_through", bid);
      }),
      expired: onceFunction((bid: OpenRTB.Bid) => {
        this.emit("expired", bid);
      }),
      findAssets: (...assets: AssetOption[]) => {
        this.emit("find_assets", assets);
      }
    };
  }
}
