import { Macro, MacroProps, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { MacroUtils } from "./MacroUtils";
import { OpenRTB } from "../../../openrtb/OpenRTB";
import { AssetUtils } from "../../../openrtb/AssetUtils";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { Dom } from "../../../misc/Dom";

export class TitleLongMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "TitleLongMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    const text = AssetUtils.findAsset(context.assets, AssetTypes.LEGACY_TITLE_LONG);
    if (!text) return context;
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
    for (let target of targets) {
      MacroUtils.insertTextAsset(target, text.title.text);
      this.props.findAssets(AssetUtils.descriptiveTextOption());
    }
    context.props.impress(context.bid);
    return context;
  }
  private selector(): string {
    return `[${this.config.titleLong.selectorAttrName}]`;
  }
}
