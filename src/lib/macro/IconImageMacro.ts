import { Macro, MacroProps, MacroContext } from "../MacroOps";
import { MacroConf } from "../Configuration";
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;

export class IconImageMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "IconImageMacro";
  }
  async applyMacro(element: HTMLElement, context: MacroContext): Promise<void> {
    const icon = AssetUtils.findAsset(context.assets, AssetTypes.ICON_URL);
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
