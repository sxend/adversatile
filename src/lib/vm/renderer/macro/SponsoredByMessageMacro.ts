import { Macro, MacroProps, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { MacroUtils } from "./MacroUtils";
import { OpenRTB } from "../../../openrtb/OpenRTB";
import { AssetUtils } from "../../../openrtb/AssetUtils";
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
      this.props.findAssets(AssetUtils.sponsoredByMessageOption());
    }
    return context;
  }
  private selector(): string {
    return `[${this.config.sponsoredByMessage.selectorAttrName}]`;
  }
}
