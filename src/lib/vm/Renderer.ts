// import { RendererOps } from "./renderer/Renderer";
import { TemplateOps } from "./renderer/Template";
import { RendererConf, AssetOption } from "../Configuration";
import { ElementModel } from "../vm/ElementModel";
import { OpenRTB } from "../openrtb/OpenRTB";
import { LockableFunction, uniq, getOrElse, values, uniqBy } from "../misc/ObjectUtils";
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
import { RemovalRenderer } from "./renderer/RemovalRenderer";

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
      new RemovalRenderer(this.config),
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
    context.props.root.render(context);
    context = await this.construct()(context);
    context.props.root.rendered(context);
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
  public template: string;
  constructor(
    public model: ElementModel,
    public element: HTMLElement,
    public props: RendererProps,
    public bid: OpenRTB.Bid
  ) {
    this.id = RandomId.gen();
    this.metadata = new RendererMetadata();
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
  addFoundAssets(...assets: AssetOption[]) {
    this.model.option.assets = uniqBy(
      this.model.option.assets.concat(assets),
      asset => asset.id
    );
  }
}
export interface RendererProps {
  root: {
    render: (context: RendererContext) => void
    rendered: (context: RendererContext) => void
  }
  impress: (bid: OpenRTB.Bid) => void;
  vimp: LockableFunction<OpenRTB.Bid>;
  disabledAreaViewabled: (bid: OpenRTB.Bid) => void;
  viewThrough: (bid: OpenRTB.Bid) => void;
  expired: (bid: OpenRTB.Bid) => void;
  onClickForSDKBridge?: (url: string, appId?: string) => void;
}
class RendererMetadata {
  public appliedRendererNames: string[] = [];
  public applied(name: string): void {
    this.appliedRendererNames = uniq(this.appliedRendererNames.concat(name));
  }
}