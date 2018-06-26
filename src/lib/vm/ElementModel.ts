import { ElementOption, ElementModelConf, AssetOption } from "../Configuration";
import { RandomId } from "../misc/RandomId";
import { EventEmitter } from "events";
import { OpenRTB } from "../openrtb/OpenRTB";
import { OpenRTBUtils } from "../openrtb/OpenRTBUtils";
import { Renderer, RendererContext, RendererEvents, RootRenderer } from "../vm/Renderer";
import { TemplateOps } from "./renderer/Template";
import { uniqBy, uniq, onceFunction, lockableFunction, rotate } from "../misc/ObjectUtils";
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
    return [imp]; // FIXME multiple imp
  }
  update(context: UpdateContext): Promise<void> {
    const bids = context.bids;
    if (bids.length === 0) return void 0;
    this.emit("update", bids);
    this.element.textContent = "";

    if (this.option.loop.enabled) {
      this.setLoop(context);
    }
    return this.applyUpdate(context)
      .then(_ => { this.emit("updated", bids) })
      .catch(console.error);
  }
  private async applyUpdate(context: UpdateContext): Promise<void> {
    const size = context.plcmtcntOrElse(this.option.placement.size);
    const bids = context.bids.slice(0, size);
    const result = bids
      .map(async (bid, index) => {
        return this.createRendererContextWithBid(context, bid, index);
      })
      .map(async context => this.renderWithContenxt(await context));
    await Promise.all(result);
  }
  private async createRendererContextWithBid(context: UpdateContext, bid: OpenRTB.Bid, index: number) {
    const sandbox = this.createSandboxElement(context, index);
    const template = await this.resolveTemplate(this.option.placement.useTemplateNames[index]);
    return this.createRenderContext(bid, index, sandbox, template)
  }
  private createSandboxElement(context: UpdateContext, index: number): HTMLElement {
    const sandbox = <HTMLElement>this.element.cloneNode();
    if (context.sandboxes[index]) {
      this.element.parentElement.replaceChild(sandbox, context.sandboxes[index]);
    } else {
      let replaceTarget = this.element.nextSibling;
      if (context.dynamic && context.dynamic.override && context.dynamic.override.position) {
        const replaceIndex = context.dynamic.override.position[index];
        if (replaceIndex !== void 0) {
          replaceTarget = this.element.parentElement.children[replaceIndex];
        }
      }
      this.element.parentElement.insertBefore(sandbox, replaceTarget);
    }
    context.sandboxes[index] = sandbox;
    this.once("update", () => sandbox.remove());
    return sandbox;
  }
  private async setLoop(context: UpdateContext): Promise<void> {
    const onExpired = async (rc: RendererContext) => {
      if (++context.loopCount < this.option.loop.limitCount) {
        rotate(context.bids, 1);
        rc = await this.createRendererContextWithBid(context, context.bids[0], rc.index);
        this.renderWithContenxt(rc);
      } else {
        this.removeListener("expired", onExpired);
      }
    };
    this.on("expired", onExpired);
    this.once("update", () => this.removeListener("expired", onExpired));
  }
  private async renderWithContenxt(context: RendererContext): Promise<void> {
    return this.renderer.render(context).then(_ => void 0);
  }
  private async preRender(): Promise<void> {
    const dummies = Array(this.option.placement.size).fill(OpenRTBUtils.dummyBid());
    await this.applyUpdate(new UpdateContext(dummies));
  }

  private async createRenderContext(
    bid: OpenRTB.Bid,
    index: number,
    element: HTMLElement,
    template: string): Promise<RendererContext> {
    const context = new RendererContext(
      this,
      element,
      template,
      this.createRendererEvents(),
      bid,
      index
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
export class UpdateContext {
  public id: string = RandomId.gen("upd")
  public loopCount: number = 0;
  public sandboxes: { [index: number]: HTMLElement } = {};
  constructor(
    public bids: OpenRTB.Bid[],
    public dynamic: UpdateDynamic = new UpdateDynamic()
  ) { }
  plcmtcntOrElse(plcmtcnt: number = 1): number {
    if (this.dynamic.override && this.dynamic.override.plcmtcnt !== void 0) {
      plcmtcnt = this.dynamic.override.plcmtcnt;
    }
    return plcmtcnt;
  }
}
export class UpdateDynamic {
  constructor(
    public pattern?: OpenRTB.Ext.Adhoc.PagePattern,
    public override?: OpenRTB.Ext.Adhoc.TagOverride
  ) {
  }
}