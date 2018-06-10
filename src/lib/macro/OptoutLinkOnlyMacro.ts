import { Macro, MacroProps } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import ResAssets = OpenRTB.NativeAd.Response.Assets;
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { resultOrElse } from "../misc/ObjectUtils";

export class OptoutLinkOnlyMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "OptoutLinkOnlyMacro";
  }
  async applyMacro(element: HTMLElement, context: any): Promise<void> {
    const optoutId = AssetUtils.getAssetIdByAsset(AssetTypes.OPTOUT_LINK);
    const assets: ResAssets[] = resultOrElse(() => context.bid.ext.admNative.assets, []);
    const optout = assets.find(asset => asset.id === optoutId);
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
