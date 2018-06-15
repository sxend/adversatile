import { Macro, MacroProps, MacroContext } from "../MacroOps";
import { MacroConf } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;

export class TitleShortMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "TitleShortMacro";
  }
  async applyMacro(element: HTMLElement, context: MacroContext): Promise<void> {
    const title = AssetUtils.findAsset(context.assets, AssetTypes.TITLE_SHORT);
    if (!title) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      MacroUtils.insertTextAsset(target, title.title.text);
      if (this.props.addAssetOptions) {
        this.props.addAssetOptions(AssetUtils.titleTextOption());
      }
    }
    context.model.emit("impression");
    return Promise.resolve();
  }
  private selector(): string {
    return `[${this.config.titleShort.selectorAttrName}]`;
  }
}
