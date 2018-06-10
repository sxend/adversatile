import { Macro } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";

export class OptoutLinkOnlyMacro implements Macro {
  constructor(
    private config: MacroConf,
    private props: {
    }
  ) { }
  getName(): string {
    return "OptoutLinkOnlyMacro";
  }
  async applyMacro(element: HTMLElement, data: any): Promise<void> {
    if (!data || !data.asset) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      const anchor: HTMLAnchorElement = document.createElement("a");
      anchor.href = data.asset.link.url;
      const anchorTarget = target.getAttribute(this.config.optoutLinkOnlyMacro.anchorTargetAttrName);
      if (anchorTarget) {
        anchor.target = anchorTarget;
      } else {
        anchor.target = '_blank';
      }
      anchor.onclick = function(e) {
        e.stopPropagation();
      }
      if (target.parentElement) {
        target.parentElement.insertBefore(anchor, target);
      }
      target.classList.add(this.config.optoutLinkOnlyMacro.markedClass);
      anchor.appendChild(target);
    }
    return Promise.resolve();
  }
  private selector(): string {
    const selector = this.config.optoutLinkOnlyMacro.selectorAttrName;
    const markedClass = this.config.optoutLinkOnlyMacro.markedClass;
    return `[${selector}]:not(.${markedClass})`;
  }
}
