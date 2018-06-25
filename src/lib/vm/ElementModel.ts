import { ElementOption, ElementModelConf, AssetOption } from "../Configuration";
import { RandomId } from "../misc/RandomId";
import { EventEmitter } from "events";
import { OpenRTB } from "../openrtb/OpenRTB";
import { OpenRTBUtils } from "../openrtb/OpenRTBUtils";
import { Renderer, RendererContext, RendererEvents, RootRenderer } from "../vm/Renderer";
import { TemplateOps } from "./renderer/Template";
import { uniqBy, uniq, onceFunction, lockableFunction } from "../misc/ObjectUtils";
import { Async } from "../misc/Async";
import { AssetUtils } from "../openrtb/AssetUtils";

export class ElementModel extends EventEmitter {
  private renderer: Renderer;
  private templateOps: TemplateOps;
  private _excludedBidders: string[] = [];
  static create(config: ElementModelConf, element: HTMLElement): Promise<ElementModel> {
    return new ElementModel(config, element).init();
  }
  private constructor(
    private config: ElementModelConf,
    private element: HTMLElement,
  ) {
    super();
    this.renderer = new RootRenderer(this.config.renderer);
    this.templateOps = new TemplateOps(this.config);
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
  get useTemplateName(): string {
    return this.element.getAttribute(this.config.useTemplateNameAttr) || this.option.useTemplateName;
  }
  get option(): ElementOption {
    return this.config.option(this.name);
  }
  private get assets(): AssetOption[] {
    return uniqBy(this.option.assets, asset => asset.id);
  }
  private get excludedBidders(): string[] {
    return uniq(this.option.excludedBidders.concat(this._excludedBidders));
  }
  private async init(): Promise<ElementModel> {
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
  async imp(): Promise<OpenRTB.Imp[]> {
    const impExt = new OpenRTB.Ext.ImpressionExt();
    impExt.excludedBidders = this.excludedBidders;
    impExt.notrim = this.option.notrim;
    const imp = await OpenRTBUtils.createImp(
      this.id,
      this.name,
      this.option.format,
      this.assets.map(AssetUtils.optionToNativeAsset),
      impExt
    );
    return [imp];
  }
  update(bids: OpenRTB.Bid[]): Promise<void> {
    if (bids.length === 0) return void 0;
    this.emit("update", bids);
    return this.render(bids)
      .then(_ => { this.emit("updated", bids) })
      .catch(console.error);
  }
  private async render(bids: OpenRTB.Bid[]): Promise<void> {
    this.element.textContent = "";

    if (this.option.loop.enabled) {
      await this.setLoop(bids);
    }
    if (this.option.multiple.enabled && bids.length > 1) {
      await this.renderMultiple(bids);
    } else {
      await this.renderSingle(bids[0]);
    }
  }
  private async renderMultiple(bids: OpenRTB.Bid[]): Promise<void> {
    const result = bids
      .map(async (bid, i) => {
        const element = <HTMLElement>this.element.cloneNode();
        this.element.appendChild(element);
        const template = await this.resolveTemplate(this.option.multiple.useTemplateNames[i]);
        return this.createRenderContext(bid, element, template)
      })
      .map(async context => this.renderWithContenxt(await context));
    await Promise.all(result);
  }
  private async renderSingle(bid: OpenRTB.Bid): Promise<void> {
    const template = await this.resolveTemplate();
    const context = await this.createRenderContext(bid, this.element, template);
    await this.renderWithContenxt(context);
  }
  private async setLoop(bids: OpenRTB.Bid[]): Promise<void> {
    let loopCount = 0;
    const onExpired = (context: RendererContext) => {
      if (loopCount++ < this.option.loop.limitCount) {
        bids.push(bids.shift());
        context.bid = bids[0];
        this.renderWithContenxt(context);
      } else {
        this.off("expired", onExpired);
      }
    };
    this.on("expired", onExpired);
    this.once("update", () => this.off("expired", onExpired));
  }
  private async renderWithContenxt(context: RendererContext): Promise<void> {
    return this.renderer.render(context).then(_ => void 0);
  }
  private async preRender(): Promise<void> {
    let dummies = [OpenRTBUtils.dummyBid()];
    if (this.option.multiple.enabled) {
      dummies = Array(Math.max(this.option.multiple.sizeHint, 1)).fill(OpenRTBUtils.dummyBid());
    }
    await this.render(dummies);
  }

  private async createRenderContext(
    bid: OpenRTB.Bid,
    element: HTMLElement,
    template: string): Promise<RendererContext> {
    const context = new RendererContext(
      this,
      element,
      template,
      this.createRendererEvents(),
      bid,
    );
    return context;
  }
  private async resolveTemplate(...templateNames: string[]): Promise<string> {
    const ids: string[] = [
      ...templateNames,
      this.useTemplateName,
      this.qualifier,
      this.name
    ];
    return this.templateOps.resolveTemplate(...ids);
  }
  private createRendererEvents(): RendererEvents {
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
      disabledAreaViewabled: onceFunction((bid: OpenRTB.Bid) => {
        this.emit("disabled_area_viewabled", bid);
      }),
      viewThrough: onceFunction((bid: OpenRTB.Bid) => {
        this.emit("view_through", bid);
      }),
      expired: onceFunction((context: RendererContext) => {
        this.emit("expired", context);
      })
    };
  }
}
