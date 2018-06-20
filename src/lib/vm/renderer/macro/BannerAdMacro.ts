import { MacroContext, Macro } from "../Macro";
import { getOrElse } from "../../../misc/ObjectUtils";
import { RendererContext } from "../../Renderer";
import { OpenRTBUtils } from "../../../openrtb/OpenRTBUtils";
import { MacroConf } from "../../../Configuration";
import { Async } from "../../../misc/Async";
import { Dom } from "../../../misc/Dom";

export class BannerAdMacro implements Macro {
  constructor(private config: MacroConf) { }
  getName(): string {
    return "BannerAdMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    if (context.model.option.isBanner()) {
      if (context.bid.ext.filler) {
        context.template = getOrElse(() => context.bid.ext.filler);
        context.model.option.macro.injectMethod = "iframe";
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
  async observeEvent(context: MacroContext) {
    Async.wait(() => {
      const result = Dom.recursiveQuerySelectorAll(context.element, this.config.bannerAd.impSelector);
      return result.length > 0;
    }, 50).then(_ => {
      context.props.impress(context.bid);
    });
  }
}