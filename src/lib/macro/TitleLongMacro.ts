import { Macro, MacroProps, MacroContext } from "../MacroOps";
import { MacroConf } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;

export class TitleLongMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "TitleLongMacro";
  }
  async applyMacro(element: HTMLElement, context: MacroContext): Promise<void> {
    const text = AssetUtils.findAsset(context.assets, AssetTypes.LEGACY_TITLE_LONG);
    if (!text) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      MacroUtils.insertTextAsset(target, text.title.text);
      if (this.props.addAssetOptions) {
        this.props.addAssetOptions(AssetUtils.descriptiveTextOption());
      }
    }
    context.model.emit("impression");
    return Promise.resolve();
  }
  private selector(): string {
    return `[${this.config.titleLong.selectorAttrName}]`;
  }
}
