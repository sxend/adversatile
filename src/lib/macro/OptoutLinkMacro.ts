import { Macro } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";

export class OptoutLinkMacro implements Macro {
  constructor(
    private config: MacroConf,
    private props: {
    }
  ) { }
  getName(): string {
    return "OptoutLinkMacro";
  }
  async applyMacro(element: HTMLElement, data: any): Promise<void> {
    if (!data || !data.asset) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      const optoutLink: HTMLAnchorElement = document.createElement("a");
      optoutLink.href = data.asset.link.url;
      optoutLink.target = '_blank';
      optoutLink.onclick = function(e) {
        e.stopPropagation();
      }
      const optoutImg: HTMLImageElement = document.createElement("img");
      optoutImg.src = data.asset.img.url;
      optoutImg.classList.add(this.config.optoutLink.markedClass);
      optoutLink.appendChild(optoutImg);
      target.parentElement.appendChild(optoutLink);
      target.parentElement.removeChild(target);
    }
    return Promise.resolve();
  }
  private selector(): string {
    return `[${this.config.optoutLink.selectorAttrName}]`;
  }
}
