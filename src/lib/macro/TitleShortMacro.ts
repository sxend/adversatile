import { Macro, MacroProps } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";
import { AssetUtils } from "../openrtb/OpenRTBUtils";

export class TitleShortMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "TitleShortMacro";
  }
  async applyMacro(element: HTMLElement, context: any): Promise<void> {
    if (!context || !context.asset || !context.asset.title) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      MacroUtils.insertTextAsset(target, context.asset.title.text);
      if (this.props.addAssetOptions) {
        this.props.addAssetOptions(AssetUtils.titleTextOption());
      }
    }
    return Promise.resolve();
  }
  private selector(): string {
    return `[${this.config.titleShort.selectorAttrName}]`;
  }
}
