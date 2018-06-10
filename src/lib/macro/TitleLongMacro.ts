import { Macro } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";

export class TitleLongMacro implements Macro {
  constructor(private config: MacroConf, private props: {}) { }
  getName(): string {
    return "TitleLongMacro";
  }
  async applyMacro(element: HTMLElement, data: any): Promise<void> {
    if (!data || !data.asset || !data.asset.title) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      MacroUtils.insertTextAsset(target, data.asset.title.text);
    }
    return Promise.resolve();
  }
  private selector(): string {
    return `[${this.config.titleLong.selectorAttrName}]`;
  }
}
