import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { OpenRTB } from "../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../openrtb/AssetUtils";
import { RendererUtils } from "./RendererUtils";
import { InjectRenderer } from "./InjectRenderer";
import { isEmptyArray } from "../../misc/TypeCheck";

export class SponsoredByMessageRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  getName(): string {
    return "SponsoredByMessageRenderer";
  }
  depends(depend: RenderDependency): void {
    depend.after([InjectRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
    const message = AssetUtils.findAsset(context.assets, AssetTypes.LEGACY_SPONSORED_BY_MESSAGE);
    if (!message) return context;
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element.target, this.selector());
    if (isEmptyArray(targets)) return context;
    for (let target of targets) {
      RendererUtils.insertTextAsset(target, message.title.text);
      context.addFoundAssets(AssetUtils.sponsoredByMessageOption());
    }
    context.metadata.applied(this.getName());
    context.metadata.setAttachment(this.getName(), targets);
    return context;
  }
  private selector(): string {
    return `[${this.config.sponsoredByMessage.selectorAttrName}]`;
  }
}
