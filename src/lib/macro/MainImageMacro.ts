import { Macro, MacroProps } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";
import { OpenRTBUtils, AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import ResAssets = OpenRTB.NativeAd.Response.Assets;
import { resultOrElse } from "../misc/ObjectUtils";


export class MainImageMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "MainImageMacro";
  }
  async applyMacro(element: HTMLElement, context: any): Promise<void> {
    const imageId = AssetUtils.getAssetIdByAsset(AssetTypes.IMAGE_URL);
    const assets: ResAssets[] = resultOrElse(() => context.bid.ext.admNative.assets, []);
    const image = assets.find(asset => asset.id === imageId);
    if (!image) return;
    const targets: HTMLImageElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      target.src = image.img.url;
      if (this.props.addAssetOptions) {
        this.props.addAssetOptions(AssetUtils.mainImageOption(target.clientWidth, target.clientHeight))
      }
    }
    return Promise.resolve();
  }
  private selector(): string {
    return `img[${this.config.mainImage.selectorAttrName}]`;
  }
}
