import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { OpenRTB } from "../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../openrtb/AssetUtils";
import { RendererUtils } from "./RendererUtils";
import { InjectRenderer } from "./InjectRenderer";

export class TitleShortRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  getName(): string {
    return "TitleShortRenderer";
  }
  depends(depend: RenderDependency): void {
    depend.after([InjectRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
    const title = AssetUtils.findAsset(context.assets, AssetTypes.TITLE_SHORT);
    if (!title) return context;
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
    for (let target of targets) {
      RendererUtils.insertTextAsset(target, title.title.text);
      context.props.findAssets(AssetUtils.titleTextOption());
    }
    context.metadata.applied(this.getName());
    context.props.impress(context.bid);
    return context;
  }
  private selector(): string {
    return `[${this.config.titleShort.selectorAttrName}]`;
  }
}
