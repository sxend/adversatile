import { Macro, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { AssetUtils } from "../../../openrtb/AssetUtils";
import { OpenRTB } from "../../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import ResAssets = OpenRTB.NativeAd.Response.Assets;
import { Tracking } from "../../../misc/Tracking";
import { Dom } from "../../../misc/Dom";


export class MarkupVideoMacro implements Macro {
  constructor(private config: MacroConf) { }
  static NAME = "MarkupVideoMacro";
  getName(): string {
    return MarkupVideoMacro.NAME;
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    const data = <ResAssets>AssetUtils.findAsset(context.assets, AssetTypes.MARKUP_VIDEO);
    if (!data || !data.data || !context.admNative || !context.admNative.link) return context;
    const link = context.admNative.link;
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
    for (let target of targets) {
      const divChildElement: HTMLElement = document.createElement("div");
      divChildElement.className = target.className;
      divChildElement.id = this.config.markupVideo.markedId;
      while (target.firstChild) {
        target.removeChild(target.firstChild);
      }
      target.appendChild(divChildElement);
      divChildElement.innerHTML = data.data.value;
      divChildElement.onclick = () => {
        Tracking.trackingCall([link.url], "click-track-beacon");
      };
      Dom.fireScript(divChildElement);
    }
    return context;
  }
  private selector(): string {
    return `[${this.config.markupVideo.markedId}]`;
  }
}
