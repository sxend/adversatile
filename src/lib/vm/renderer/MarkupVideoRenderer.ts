import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { OpenRTB } from "../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../openrtb/AssetUtils";
import ResAssets = OpenRTB.NativeAd.Response.Assets;
import { Tracking } from "../../misc/Tracking";
import { InjectRenderer } from "./InjectRenderer";

export class MarkupVideoRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  static NAME = "MarkupVideoRenderer";
  getName(): string {
    return MarkupVideoRenderer.NAME;
  }
  depends(depend: RenderDependency): void {
    depend.after([InjectRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
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
    context.metadata.applied(this.getName());
    return context;
  }
  private selector(): string {
    return `[${this.config.markupVideo.markedId}]`;
  }
}
