import { TemplateOps } from "./renderer/Template";
import { RendererConf, AssetOption, ElementOption } from "../Configuration";
import { ElementModel } from "../vm/ElementModel";
import { OpenRTB } from "../openrtb/OpenRTB";
import { uniq, getOrElse, values, uniqBy, contains } from "../misc/ObjectUtils";
import { NanoTemplateRenderer } from "./renderer/NanoTemplateRenderer";
import { InjectRenderer } from "./renderer/InjectRenderer";
import { VideoRenderer } from "./renderer/VideoRenderer";
import { MarkupVideoRenderer } from "./renderer/MarkupVideoRenderer";
import { MainImageRenderer } from "./renderer/MainImageRenderer";
import { IconImageRenderer } from "./renderer/IconImageRenderer";
import { OptoutLinkRenderer } from "./renderer/OptoutLinkRenderer";
import { OptoutLinkOnlyRenderer } from "./renderer/OptoutLinkOnlyRenderer";
import { SponsoredByMessageRenderer } from "./renderer/SponsoredByMessageRenderer";
import { TitleLongRenderer } from "./renderer/TitleLongRenderer";
import { TitleShortRenderer } from "./renderer/TitleShortRenderer";
import { LinkJsRenderer } from "./renderer/LinkJsRenderer";
import { LinkRenderer } from "./renderer/LinkRenderer";
import { Tsort } from "../misc/Tsort";
import { RandomId } from "../misc/RandomId";
import { ObserveRenderer } from "./renderer/ObserveRenderer";
import { isDefined } from "../misc/TypeCheck";
import { NativeBridge } from "../../ext/NativeBridge";

export class RootRenderer implements Renderer {
  public static NAME: string = "Root";
  private renderers: { [name: string]: Renderer };
  constructor(
    private config: RendererConf,
  ) {
    this.renderers = [
      new LinkJsRenderer(this.config),
      new LinkRenderer(this.config),
      new NanoTemplateRenderer(),
      new InjectRenderer(this.config),
      new VideoRenderer(this.config),
      new MarkupVideoRenderer(this.config),
      new MainImageRenderer(this.config),
      new IconImageRenderer(this.config),
      new OptoutLinkRenderer(this.config),
      new OptoutLinkOnlyRenderer(this.config),
      new SponsoredByMessageRenderer(this.config),
      new TitleLongRenderer(this.config),
      new TitleShortRenderer(this.config),
      new ObserveRenderer(this.config),
    ].reduce((map: { [name: string]: Renderer }, renderer) => {
      map[renderer.getName()] = renderer;
      return map;
    }, {});
    this.config.plugins.forEach(plugin => {
      plugin.install(this);
      values(this.renderers).forEach(renderer => plugin.install(renderer));
    });
  }
  async render(context: RendererContext): Promise<RendererContext> {
    context.events.root.render(context);
    context = await this.construct()(context);
    context.events.root.rendered(context);
    return context;
  }
  construct(): (context: RendererContext) => Promise<RendererContext> {
    const sorted = this.sort();
    return async (context: RendererContext) => {
      for (let renderer of sorted) {
        context = await renderer.render(context);
      }
      return context;
    }
  }
  sort(): Renderer[] {
    const tsort = new Tsort<Renderer>(renderer => renderer.getName());
    values(this.renderers).forEach(renderer => {
      tsort.add(renderer);
      const depend: RenderDependency = {
        before: (names: string[]) => {
          names.forEach(name => {
            tsort.add(renderer, this.renderers[name]);
          });
        },
        after: (names: string[]) => {
          names.forEach(name => {
            tsort.add(this.renderers[name], renderer);
          });
        }
      }
      renderer.depends(depend)
    });
    return tsort.sort();
  }
  getName(): string {
    return "Root";
  }
  depends(_: RenderDependency): void { }
}
export interface RenderStatic {
  new(
    config: RendererConf,
    templateOps: TemplateOps,
  ): Renderer;
  NAME: string
}
export interface Renderer {
  getName(): string;
  render(context: RendererContext): Promise<RendererContext>;
  depends(depend: RenderDependency): void;
}
export interface RenderDependency {
  before(name: string[]): void;
  after(name: string[]): void;
}
export class RendererContext {
  public id: string;
  public metadata: RendererMetadata;
  public environment: RendererEnvironment;
  constructor(
    public element: RendererElement,
    public events: RendererEvents,
    public template: string,
    public bid: OpenRTB.Bid,
    public bidIndex: number,
  ) {
    this.id = RandomId.gen();
    this.metadata = new RendererMetadata();
    this.environment = new RendererEnvironment()
  }
  get assets(): OpenRTB.NativeAd.Response.Assets[] {
    return getOrElse(() => this.bid.ext.admNative.assets, []);
  }
  get admNative(): OpenRTB.NativeAd.AdResponse {
    return getOrElse(() => this.bid.ext.admNative);
  }
  get filler(): string {
    return getOrElse(() => this.bid.ext.filler);
  }
  get bannerHtml(): string {
    return getOrElse(() => this.bid.ext.bannerHtml);
  }
  addFoundAssets(...assets: AssetOption[]) {
    this.element.option.assets = uniqBy(
      this.element.option.assets.concat(assets),
      asset => asset.id
    );
  }
}
export class RendererElement {
  constructor(
    public model: ElementModel,
    public target: HTMLElement,
    public option: ElementOption
  ) { }
}
export interface RendererEvents {
  root: {
    render: (context: RendererContext) => void
    rendered: (context: RendererContext) => void
  }
  impress: (context: RendererContext) => void;
  vimp: (context: RendererContext) => void;
  viewThrough: (context: RendererContext) => void;
  click: (context: RendererContext) => void;
  expired: (context: RendererContext) => void;
}
export class RendererMetadata {
  public appliedRendererNames: string[] = [];
  public attachments: { [name: string]: any } = {};
  public applied(name: string): void {
    this.appliedRendererNames = uniq(this.appliedRendererNames.concat(name));
  }
  public isAppied(name: string): boolean {
    return contains(this.appliedRendererNames, name);
  }
  public setAttachment(name: string, attachment: any): void {
    this.attachments[name] = attachment;
  }
  public getAttachment(name: string): any {
    return this.attachments[name];
  }
}
export class RendererEnvironment {
  public nativeBridge: NativeBridge = (<any>window).advNativeBridge;
  public hasNativeBridge: boolean = isDefined(this.nativeBridge);
}