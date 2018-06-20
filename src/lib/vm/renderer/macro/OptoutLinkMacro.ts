import { Macro, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { OpenRTB } from "../../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../../openrtb/AssetUtils";
import { Dom } from "../../../misc/Dom";

export class OptoutLinkMacro implements Macro {
  constructor(private config: MacroConf) { }
  getName(): string {
    return "OptoutLinkMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    const image = AssetUtils.findAsset(context.assets, AssetTypes.OPTOUT_IMG);
    if (!image) return context;
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
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
    return context;
  }
  private selector(): string {
    return `[${this.config.optoutLink.selectorAttrName}]`;
  }
}
