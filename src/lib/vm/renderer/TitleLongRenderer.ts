import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { OpenRTB } from "../../openrtb/OpenRTB";
import { AssetUtils } from "../../openrtb/AssetUtils";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { RendererUtils } from "./RendererUtils";
import { InjectRenderer } from "./InjectRenderer";

export class TitleLongRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  getName(): string {
    return "TitleLongRenderer";
  }
  depends(depend: RenderDependency): void {
    depend.after([InjectRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
    const text = AssetUtils.findAsset(context.assets, AssetTypes.LEGACY_TITLE_LONG);
    if (!text) return context;
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
    for (let target of targets) {
      RendererUtils.insertTextAsset(target, text.title.text);
      context.props.findAssets(AssetUtils.descriptiveTextOption());
    }
    context.metadata.applied(this.getName());
    context.props.impress(context.bid);
    return context;
  }
  private selector(): string {
    return `[${this.config.titleLong.selectorAttrName}]`;
  }
}
