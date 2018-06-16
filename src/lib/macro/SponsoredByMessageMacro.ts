import { Macro, MacroProps, MacroContext } from "../MacroOps";
import { MacroConf } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;

export class SponsoredByMessageMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "SponsoredByMessageMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    const message = AssetUtils.findAsset(context.assets, AssetTypes.LEGACY_SPONSORED_BY_MESSAGE);
    if (!message) return context;
    const targets: HTMLElement[] = [].slice.call(
      context.element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return context;
    for (let target of targets) {
      MacroUtils.insertTextAsset(target, message.title.text);
      if (this.props.addAssetOptions) {
        this.props.addAssetOptions(AssetUtils.sponsoredByMessageOption());
      }
    }
    return context;
  }
  private selector(): string {
    return `[${this.config.sponsoredByMessage.selectorAttrName}]`;
  }
}
