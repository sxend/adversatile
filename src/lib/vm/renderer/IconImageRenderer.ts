import { RendererContext, Renderer } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { OpenRTB } from "../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../openrtb/AssetUtils";


export class IconImageRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  getName(): string {
    return "IconImageRenderer";
  }
  async render(context: RendererContext): Promise<RendererContext> {
    const icon = AssetUtils.findAsset(context.assets, AssetTypes.ICON_URL);
    if (!icon) return context;
    const targets: HTMLImageElement[] =
      <HTMLImageElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
    for (let target of targets) {
      target.src = icon.img.url;
      context.props.findAssets(AssetUtils.iconImageOption(target.clientWidth, target.clientHeight));
    }
    context.props.impress(context.bid);
    return context;
  }
  private selector(): string {
    return `img[${this.config.iconImage.selectorAttrName}]`;
  }
}
