import { ElementOption, ElementModelConf } from "../Configuration";
import { RandomId } from "../misc/RandomId";
import { EventEmitter } from "events";
import { OpenRTB } from "../openrtb/OpenRTB";
import { Renderer, RendererContext, RendererEvents, RootRenderer, RendererElement } from "../vm/Renderer";
import { TemplateOps } from "./renderer/Template";
import { onceFunction, rotate, getOrElse } from "../misc/ObjectUtils";
import { isDefined } from "../misc/TypeCheck";

export class ElementModel extends EventEmitter {
  private renderer: Renderer;
  private templateOps: TemplateOps;
  constructor(
    private config: ElementModelConf,
    readonly element: HTMLElement,
  ) {
    super();
    this.renderer = new RootRenderer(this.config.renderer);
    this.templateOps = new TemplateOps(this.config);
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
  update(context: UpdateContext): Promise<void> {
    this.emit("update", context);
    this.element.textContent = "";

    if (context.option.loop.enabled) {
      this.setLoop(context);
    }
    return this.applyUpdate(context)
      .then(_ => { this.emit("updated", context) })
      .catch(console.error);
  }

  private async applyUpdate(context: UpdateContext): Promise<void> {
    const size = context.plcmtcntOrElse(context.option.placement.size);
    const bids = context.bids.slice(0, size);
    const result = bids
      .map(async (bid, index) => {
        return this.createRendererContextWithBid(context, bid, index);
      })
      .map(async context => this.renderWithContenxt(await context));
    await Promise.all(result);
  }

  private async createRendererContextWithBid(context: UpdateContext, bid: OpenRTB.Bid, bidIndex: number) {
    const target = this.createSandboxElement(context, bidIndex);
    const template = await this.resolveTemplate(context, bidIndex);
    return this.createRenderContext(target, context.option, template, bid, bidIndex)
  }

  private createSandboxElement(context: UpdateContext, bidIndex: number): HTMLElement {
    const sandbox = <HTMLElement>this.element.cloneNode();
    if (context.targets[bidIndex]) {
      this.element.parentElement.replaceChild(sandbox, context.targets[bidIndex]);
    } else {
      let insertTarget = this.element.nextSibling; // insert after this.element
      const position = getOrElse(() => context.dynamic.override.position);
      if (position) {
        const insertTargetIndex = position[bidIndex];
        if (isDefined(insertTargetIndex)) {
          insertTarget = this.element.parentElement.children[insertTargetIndex];
        }
      }
      this.element.parentElement.insertBefore(sandbox, insertTarget);
    }
    context.targets[bidIndex] = sandbox;
    this.once("update", () => sandbox.remove());
    return sandbox;
  }
  private async setLoop(context: UpdateContext): Promise<void> {
    const onExpired = async (rc: RendererContext) => {
      if (++context.loopCount < context.option.loop.limitCount) {
        rotate(context.bids, 1);
        rc = await this.createRendererContextWithBid(context, context.bids[0], rc.bidIndex);
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

  private async createRenderContext(
    target: HTMLElement,
    option: ElementOption,
    template: string,
    bid: OpenRTB.Bid,
    bidIndex: number,
  ): Promise<RendererContext> {
    const context = new RendererContext(
      new RendererElement(
        this,
        target,
        option
      ),
      this.createRendererEvents(),
      template,
      bid,
      bidIndex
    );
    return context;
  }
  private async resolveTemplate(context: UpdateContext, bidIndex: number): Promise<string> {
    const patternId = getOrElse(() => context.dynamic.pattern.id);
    const patternTemplates = context.option.dynamic.useTemplateNamesByPattern[patternId];
    const ids: string[] = [
      isDefined(patternTemplates) ? patternTemplates[bidIndex] : void 0,
      bidIndex > 0 ? context.option.placement.useTemplateNames[bidIndex] : void 0, // FIXME placement resolution
      context.option.useTemplateName,
      this.element.getAttribute(this.config.useTemplateNameAttr),
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
      impress: onceFunction((context: RendererContext) => {
        this.emit("impression", context);
      }),
      vimp: onceFunction((context: RendererContext) => {
        this.emit("viewable_impression", context);
      }),
      viewThrough: onceFunction((context: RendererContext) => {
        this.emit("view_through", context);
      }),
      click: onceFunction((context: RendererContext) => {
        this.emit("click", context);
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
  public targets: { [index: number]: HTMLElement } = {};
  constructor(
    public bids: OpenRTB.Bid[],
    public option: ElementOption,
    public dynamic: UpdateDynamic = new UpdateDynamic()
  ) { }
  plcmtcntOrElse(plcmtcnt: number = 1): number {
    return getOrElse(() => this.dynamic.override.plcmtcnt, plcmtcnt);
  }
}
export class UpdateDynamic {
  constructor(
    public pattern?: OpenRTB.Ext.Adhoc.PagePattern,
    public override?: OpenRTB.Ext.Adhoc.TagOverride
  ) {
  }
}