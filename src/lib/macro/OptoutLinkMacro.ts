import { Macro, MacroProps, MacroContext } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import ResAssets = OpenRTB.NativeAd.Response.Assets;
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { resultOrElse } from "../misc/ObjectUtils";

export class OptoutLinkMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "OptoutLinkMacro";
  }
  async applyMacro(element: HTMLElement, context: MacroContext): Promise<void> {
    const image = AssetUtils.findAsset(context.assets, AssetTypes.OPTOUT_IMG);
    if (!image) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      const optoutLink: HTMLAnchorElement = document.createElement("a");
      optoutLink.href = image.link.url;
      optoutLink.target = "_blank";
      optoutLink.onclick = function(e) {
        e.stopPropagation();
      };
      const optoutImg: HTMLImageElement = document.createElement("img");
      optoutImg.src = image.img.url;
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
