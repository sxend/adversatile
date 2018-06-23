import { ElementOption, ElementModelConf, AssetOption } from "../Configuration";
import { RandomId } from "../misc/RandomId";
import { EventEmitter } from "events";
import { OpenRTB } from "../openrtb/OpenRTB";
import { OpenRTBUtils } from "../openrtb/OpenRTBUtils";
import { Renderer, RendererContext, RendererProps, RootRenderer } from "../vm/Renderer";
import { TemplateOps } from "./renderer/Template";
import { uniqBy, uniq, onceFunction, lockableFunction, flatten } from "../misc/ObjectUtils";
import { Async } from "../misc/Async";
import { AssetUtils } from "../openrtb/AssetUtils";

export class ElementModel extends EventEmitter {
  private renderer: Renderer;
  private templateOps: TemplateOps;
  private _excludedBidders: string[] = [];
  private children: ElementModel[] = [];
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
        if (this.option.isParent()) {
          Promise.all(this.option.children.map(child => {
            const element = <HTMLElement>this.element.cloneNode();
            element.setAttribute(this.config.nameAttributeName, child);
            return ElementModel.create(this.config, element);
          })).then(children => {
            this.children = children;
            resolve(this);
          });
        } else {
          if (this.option.preRender) {
            this.preRender().then(_ => resolve(this));
          } else {
            resolve(this)
          }
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
    if (this.option.isParent()) {
      return flatten(await Promise.all(this.children.map(child => child.imp())));
    }
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
    this.emit("update", bids);
    return new Promise<void>(async resolve => {
      if (this.option.isParent()) {
        const childrenP = this.children.map(child => child.update(bids.filter(bid => bid.ext.tagid === child.name)));
        await Promise.all(childrenP).then(_ => void 0).catch(console.error);
      } else {
        await this.render(bids);
      }
      resolve();
    })
      .then(_ => { this.emit("updated", bids) })
      .catch(console.error);
  }
  private async render(bids: OpenRTB.Bid[]): Promise<void> {
    const context = await this.createRenderContext(bids);
    if (this.option.loop.enabled) {
      this.setLoop(bids);
    }
    this.renderWithContenxt(context);
  }
  private async setLoop(bids: OpenRTB.Bid[]): Promise<void> {
    let loopCount = 0;
    const onExpired = (context: RendererContext) => {
      if (loopCount++ < this.option.loop.limitCount) {
        bids.push(context.bids.shift());
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
    const context = await this.createRenderContext(dummies);
    await this.renderWithContenxt(context);
  }

  private async createRenderContext(bids: OpenRTB.Bid[]): Promise<RendererContext> {
    const context = new RendererContext(
      this,
      this.element,
      this.createRenderProps(),
      bids,
    );
    context.template = await this.resolveTemplate();
    return context;
  }
  private async resolveTemplate(): Promise<string> {
    const ids: string[] = [
      this.useTemplateName,
      this.qualifier,
      this.name
    ];
    return this.templateOps.resolveTemplate(...ids);
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
      expired: onceFunction((context: RendererContext) => {
        this.emit("expired", context);
      })
    };
  }
}
