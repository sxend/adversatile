import { getOrElse } from "../../misc/ObjectUtils";
import { RendererContext, Renderer } from "../Renderer";
import { OpenRTBUtils } from "../../openrtb/OpenRTBUtils";
import { RendererConf } from "../../Configuration";
import { Async } from "../../misc/Async";
import { Dom } from "../../misc/Dom";

export class BannerAdRenderer implements Renderer {
  static NAME: string = "BannerAdRenderer";
  constructor(private config: RendererConf) { }
  getName(): string {
    return BannerAdRenderer.NAME;
  }
  async render(context: RendererContext): Promise<RendererContext> {
    if (context.model.option.isBanner()) {
      if (context.bid.ext.filler) {
        context.template = getOrElse(() => context.bid.ext.filler);
        context.model.option.renderer.injectMethod = "iframe";
      }
      context.template = context.template || getOrElse(() => context.bid.ext.bannerHtml);
      if (!OpenRTBUtils.isDummyBid(context.bid)) {
        context.model.once("rendered", (_: RendererContext) => {
          this.observeEvent(context);
        });
      }
    }
    return context;
  }
  async observeEvent(context: RendererContext) {
    Async.wait(() => {
      const result = Dom.recursiveQuerySelectorAll(context.element, this.config.bannerAd.impSelector);
      return result.length > 0;
    }, 50).then(_ => {
      context.props.impress(context.bid);
    });
  }
}