import { Macro, MacroProps, MacroContext } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import ResAssets = OpenRTB.NativeAd.Response.Assets;
import { Tracking } from "../misc/Tracking";


export class MarkupVideoMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "MarkupVideoMacro";
  }
  async applyMacro(element: HTMLElement, context: MacroContext): Promise<void> {
    const data = <ResAssets>AssetUtils.findAsset(context.assets, AssetTypes.MARKUP_VIDEO);
    if (!data || !data.data || !context.admNative || !context.admNative.link) return;
    const link = context.admNative.link;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
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
      // fireScript(divChildElements); // FIXME fire inner script tag
    }
    return Promise.resolve();
  }
  private selector(): string {
    return `[${this.config.markupVideo.markedId}]`;
  }
}
