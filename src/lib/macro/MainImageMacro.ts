import { Macro, MacroProps, MacroContext } from "../MacroOps";
import { MacroConf } from "../Configuration";
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;

export class MainImageMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "MainImageMacro";
  }
  async applyMacro(element: HTMLElement, context: MacroContext): Promise<void> {
    const image = AssetUtils.findAsset(context.assets, AssetTypes.IMAGE_URL);
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
