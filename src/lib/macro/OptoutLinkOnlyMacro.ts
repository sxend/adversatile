import { Macro, MacroContext } from "../MacroOps";
import { MacroConf } from "../Configuration";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../openrtb/OpenRTBUtils";

export class OptoutLinkOnlyMacro implements Macro {
  constructor(private config: MacroConf) { }
  getName(): string {
    return "OptoutLinkOnlyMacro";
  }
  async applyMacro(element: HTMLElement, context: MacroContext): Promise<void> {
    const optout = AssetUtils.findAsset(context.assets, AssetTypes.OPTOUT_LINK);
    if (!optout) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      const anchor: HTMLAnchorElement = document.createElement("a");
      anchor.href = optout.link.url;
      const anchorTarget = target.getAttribute(
        this.config.optoutLinkOnly.anchorTargetAttrName
      );
      if (anchorTarget) {
        anchor.target = anchorTarget;
      } else {
        anchor.target = "_blank";
      }
      anchor.onclick = function(e) {
        e.stopPropagation();
      };
      if (target.parentElement) {
        target.parentElement.insertBefore(anchor, target);
      }
      target.classList.add(this.config.optoutLinkOnly.markedClass);
      anchor.appendChild(target);
    }
    return Promise.resolve();
  }
  private selector(): string {
    const selector = this.config.optoutLinkOnly.selectorAttrName;
    const markedClass = this.config.optoutLinkOnly.markedClass;
    return `[${selector}]:not(.${markedClass})`;
  }
}
