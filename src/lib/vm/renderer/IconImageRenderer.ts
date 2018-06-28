import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { OpenRTB } from "../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../openrtb/AssetUtils";
import { InjectRenderer } from "./InjectRenderer";
import { isEmptyArray } from "../../misc/TypeCheck";


export class IconImageRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  getName(): string {
    return "IconImageRenderer";
  }
  depends(depend: RenderDependency): void {
    depend.after([InjectRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
    const icon = AssetUtils.findAsset(context.assets, AssetTypes.ICON_URL);
    if (!icon) return context;
    const targets: HTMLImageElement[] =
      <HTMLImageElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (isEmptyArray(targets)) return context;
    for (let target of targets) {
      target.src = icon.img.url;
      context.addFoundAssets(AssetUtils.iconImageOption(target.clientWidth, target.clientHeight));
    }
    context.events.impress(context.bid);
    return context;
  }
  private selector(): string {
    return `img[${this.config.iconImage.selectorAttrName}]`;
  }
}
