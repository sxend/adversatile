import { Macro, MacroProps, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { MacroUtils } from "./MacroUtils";
import { OpenRTB } from "../../../openrtb/OpenRTB";
import { AssetUtils } from "../../../openrtb/AssetUtils";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { Dom } from "../../../misc/Dom";

export class TitleShortMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "TitleShortMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    const title = AssetUtils.findAsset(context.assets, AssetTypes.TITLE_SHORT);
    if (!title) return context;
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
    for (let target of targets) {
      MacroUtils.insertTextAsset(target, title.title.text);
      this.props.findAssets(AssetUtils.titleTextOption());
    }
    context.props.impress(context.bid);
    return context;
  }
  private selector(): string {
    return `[${this.config.titleShort.selectorAttrName}]`;
  }
}
