import { Macro } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";

export class MarkupVideoMacro implements Macro {
  constructor(
    private config: MacroConf,
    private props: {
    }
  ) { }
  getName(): string {
    return "MarkupVideoMacro";
  }
  async applyMacro(element: HTMLElement, data: any): Promise<void> {
    if (!data) return;
    const targets: HTMLAnchorElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
    }
    return Promise.resolve();
  }
  private selector(): string {
    return "";
  }
}
