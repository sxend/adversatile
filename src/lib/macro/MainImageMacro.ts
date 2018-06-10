import { Macro } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";

export class MainImageMacro implements Macro {
  constructor(
    private config: MacroConf,
    private props: {
    }
  ) { }
  getName(): string {
    return "MainImageMacro";
  }
  async applyMacro(element: HTMLElement, data: any): Promise<void> {
    if (!data || !data.asset) return;
    const targets: HTMLImageElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      target.src = data.asset.img.url;
    }
    return Promise.resolve();
  }
  private selector(): string {
    return `img[${this.config.mainImage.selectorAttrName}]`;
  }
}
