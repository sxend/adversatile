import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { OpenRTB } from "../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../openrtb/AssetUtils";
import { InjectRenderer } from "./InjectRenderer";
import { isEmptyArray } from "../../misc/TypeCheck";

export class OptoutLinkRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  getName(): string {
    return "OptoutLinkRenderer";
  }
  depends(depend: RenderDependency): void {
    depend.after([InjectRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
    const image = AssetUtils.findAsset(context.assets, AssetTypes.OPTOUT_IMG);
    if (!image) return context;
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (isEmptyArray(targets)) return context;
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
    context.metadata.applied(this.getName());
    return context;
  }
  private selector(): string {
    return `[${this.config.optoutLink.selectorAttrName}]`;
  }
}
