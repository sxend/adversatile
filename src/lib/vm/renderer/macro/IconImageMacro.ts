import { Macro, MacroProps, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { OpenRTB } from "../../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../../openrtb/AssetUtils";
import { Dom } from "../../../misc/Dom";

export class IconImageMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "IconImageMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    const icon = AssetUtils.findAsset(context.assets, AssetTypes.ICON_URL);
    if (!icon) return context;
    const targets: HTMLImageElement[] =
      <HTMLImageElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
    for (let target of targets) {
      target.src = icon.img.url;
      this.props.findAssets(AssetUtils.iconImageOption(target.clientWidth, target.clientHeight));
    }
    context.props.impress(context.bid);
    return context;
  }
  private selector(): string {
    return `img[${this.config.iconImage.selectorAttrName}]`;
  }
}
