import { Macro, MacroProps, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { OpenRTB } from "../../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../../openrtb/AssetUtils";
import { Dom } from "../../../misc/Dom";
import { contains } from "../../../misc/ObjectUtils";
import { VideoMacro } from "./VideoMacro";

export class MainImageMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "MainImageMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    const targets: HTMLImageElement[] =
      <HTMLImageElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
    if (contains(context.metadata.appliedMacroNames, VideoMacro.NAME)) {
      targets.forEach(target => target.remove());
      return context;
    }
    const image = AssetUtils.findAsset(context.assets, AssetTypes.IMAGE_URL);
    if (!image) return context;
    for (let target of targets) {
      target.src = image.img.url;
      this.props.findAssets(AssetUtils.mainImageOption(target.clientWidth, target.clientHeight))
    }
    context.metadata.applied(this.getName());
    context.props.impress(context.bid);
    return context;
  }
  private selector(): string {
    return `img[${this.config.mainImage.selectorAttrName}]`;
  }
}
