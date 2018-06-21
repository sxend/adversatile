import { RendererContext, Renderer } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { OpenRTB } from "../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../openrtb/AssetUtils";
import { RendererUtils } from "./RendererUtils";

export class SponsoredByMessageRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  getName(): string {
    return "SponsoredByMessageRenderer";
  }
  async render(context: RendererContext): Promise<RendererContext> {
    const message = AssetUtils.findAsset(context.assets, AssetTypes.LEGACY_SPONSORED_BY_MESSAGE);
    if (!message) return context;
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
    for (let target of targets) {
      RendererUtils.insertTextAsset(target, message.title.text);
      context.props.findAssets(AssetUtils.sponsoredByMessageOption());
    }
    context.metadata.applied(this.getName());
    return context;
  }
  private selector(): string {
    return `[${this.config.sponsoredByMessage.selectorAttrName}]`;
  }
}