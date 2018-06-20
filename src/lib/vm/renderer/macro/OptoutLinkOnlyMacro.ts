import { Macro, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { OpenRTB } from "../../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../../openrtb/AssetUtils";
import { Dom } from "../../../misc/Dom";

export class OptoutLinkOnlyMacro implements Macro {
  constructor(private config: MacroConf) { }
  getName(): string {
    return "OptoutLinkOnlyMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    const optout = AssetUtils.findAsset(context.assets, AssetTypes.OPTOUT_LINK);
    if (!optout) return context;
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
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
    return context;
  }
  private selector(): string {
    const selector = this.config.optoutLinkOnly.selectorAttrName;
    const markedClass = this.config.optoutLinkOnly.markedClass;
    return `[${selector}]:not(.${markedClass})`;
  }
}
