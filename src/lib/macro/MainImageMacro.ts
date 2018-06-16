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
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    const image = AssetUtils.findAsset(context.assets, AssetTypes.IMAGE_URL);
    if (!image) return context;
    const targets: HTMLImageElement[] = [].slice.call(
      context.element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return context;
    for (let target of targets) {
      target.src = image.img.url;
      if (this.props.addAssetOptions) {
        this.props.addAssetOptions(AssetUtils.mainImageOption(target.clientWidth, target.clientHeight))
      }
    }
    context.props.impress();
    return context;
  }
  private selector(): string {
    return `img[${this.config.mainImage.selectorAttrName}]`;
  }
}
