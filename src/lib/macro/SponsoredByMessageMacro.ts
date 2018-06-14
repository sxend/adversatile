import { Macro, MacroProps, MacroContext } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import ResAssets = OpenRTB.NativeAd.Response.Assets;
import { resultOrElse } from "../misc/ObjectUtils";

export class SponsoredByMessageMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "SponsoredByMessageMacro";
  }
  async applyMacro(element: HTMLElement, context: MacroContext): Promise<void> {
    const message = AssetUtils.findAsset(context.assets, AssetTypes.LEGACY_SPONSORED_BY_MESSAGE);
    if (!message) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      MacroUtils.insertTextAsset(target, message.title.text);
      if (this.props.addAssetOptions) {
        this.props.addAssetOptions(AssetUtils.sponsoredByMessageOption());
      }
    }
    return Promise.resolve();
  }
  private selector(): string {
    return `[${this.config.sponsoredByMessage.selectorAttrName}]`;
  }
}
