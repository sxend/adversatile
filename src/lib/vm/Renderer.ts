// import { RendererOps } from "./renderer/Renderer";
import { TemplateOps } from "./renderer/Template";
import { RendererConf, AssetOption } from "../Configuration";
import { ElementModel } from "../vm/ElementModel";
import { OpenRTB } from "../openrtb/OpenRTB";
import { LockableFunction, uniq, getOrElse } from "../misc/ObjectUtils";
import { BannerAdRenderer } from "./renderer/BannerAdRenderer";
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

export class RootRenderer implements Renderer {
  public static NAME: string = "Root"
  constructor(
    private config: RendererConf,
  ) {
    this.config.plugins.forEach(plugin => plugin.install(this));
  }
  async render(context: RendererContext): Promise<RendererContext> {
    context.props.root.render(context);
    context = await this.construct()(context);
    // let rendererContext = new RendererContext(
    //   context.model,
    //   context.element,
    //   context.props,
    //   template,
    //   context.bid
    // );
    // await this.rendererOps.render(rendererContext);
    context.props.root.rendered(context);
    return context;
  }
  construct(): (context: RendererContext) => Promise<RendererContext> {
    const renderers: Renderer[] = [
      new BannerAdRenderer(this.config),
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
      new LinkJsRenderer(this.config),
      new LinkRenderer(this.config)
    ];
    return async (context: RendererContext) => {
      for (let renderer of renderers) {
        context = await renderer.render(context);
      }
      return context;
    }
  }
  getName(): string {
    return "Root";
  }
  // depends(): RenderStatic[] {
  //   return [];
  // }
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
  // depends(): RenderStatic[];
}
export class RendererContext {
  public metadata: RendererMetadata;
  public assets: OpenRTB.NativeAd.Response.Assets[];
  public admNative: OpenRTB.NativeAd.AdResponse;
  public template: string;
  constructor(
    public model: ElementModel,
    public element: HTMLElement,
    public props: RendererProps,
    public bid: OpenRTB.Bid
  ) {
    this.assets = getOrElse(() => bid.ext.admNative.assets, []);
    this.admNative = getOrElse(() => bid.ext.admNative);
    this.metadata = new RendererMetadata();
  }
}
export interface RendererProps {
  root: {
    render: (context: RendererContext) => void
    rendered: (context: RendererContext) => void
  }
  impress: (bid: OpenRTB.Bid) => void;
  vimp: LockableFunction<OpenRTB.Bid>;
  viewThrough: (bid: OpenRTB.Bid) => void;
  findAssets: (...option: AssetOption[]) => void;
  onClickForSDKBridge?: (url: string, appId?: string) => void;
}
class RendererMetadata {
  public appliedRendererNames: string[] = [];
  public applied(name: string): void {
    this.appliedRendererNames = uniq(this.appliedRendererNames.concat(name));
  }
}