import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { OpenRTB } from "../../openrtb/OpenRTB";
import { AssetUtils } from "../../openrtb/AssetUtils";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { RendererUtils } from "./RendererUtils";
import { InjectRenderer } from "./InjectRenderer";
import { isEmptyArray } from "../../misc/TypeCheck";

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
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element.target, this.selector());
    if (isEmptyArray(targets)) return context;
    for (let target of targets) {
      RendererUtils.insertTextAsset(target, text.title.text);
      context.addFoundAssets(AssetUtils.descriptiveTextOption());
    }
    context.metadata.applied(this.getName());
    context.events.impress(context);
    return context;
  }
  private selector(): string {
    return `[${this.config.titleLong.selectorAttrName}]`;
  }
}
