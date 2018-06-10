import { Macro, MacroProps } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import ResAssets = OpenRTB.NativeAd.Response.Assets;
import { resultOrElse } from "../misc/ObjectUtils";

export class IconImageMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "IconImageMacro";
  }
  async applyMacro(element: HTMLElement, context: any): Promise<void> {
    const iconId = AssetUtils.getAssetIdByAsset(AssetTypes.ICON_URL);
    const assets: ResAssets[] = resultOrElse(() => context.bid.ext.admNative.assets, []);
    const icon = assets.find(asset => asset.id === iconId);
    if (!icon) return;
    const targets: HTMLImageElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      target.src = icon.img.url;
      if (this.props.addAssetOptions) {
        this.props.addAssetOptions(AssetUtils.iconImageOption(target.clientWidth, target.clientHeight));
      }
    }
    return Promise.resolve();
  }
  private selector(): string {
    return `img[${this.config.iconImage.selectorAttrName}]`;
  }
}
