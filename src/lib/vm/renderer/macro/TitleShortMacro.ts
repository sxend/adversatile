import { Macro, MacroProps, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { MacroUtils } from "./MacroUtils";
import { AssetUtils } from "../../../openrtb/OpenRTBUtils";
import { OpenRTB } from "../../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;

export class TitleShortMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "TitleShortMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    const title = AssetUtils.findAsset(context.assets, AssetTypes.TITLE_SHORT);
    if (!title) return context;
    const targets: HTMLElement[] = [].slice.call(
      context.element.querySelectorAll(this.selector())
    );
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
