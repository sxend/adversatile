import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { OpenRTB } from "../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../openrtb/AssetUtils";
import { contains } from "../../misc/ObjectUtils";
import { VideoRenderer } from "./VideoRenderer";
import { InjectRenderer } from "./InjectRenderer";
import { isEmptyArray } from "../../misc/TypeCheck";

export class MainImageRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  getName(): string {
    return "MainImageRenderer";
  }
  depends(depend: RenderDependency): void {
    depend.after([InjectRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
    const targets: HTMLImageElement[] =
      <HTMLImageElement[]>Dom.recursiveQuerySelectorAll(context.element.target, this.selector());
    if (isEmptyArray(targets)) return context;
    if (contains(context.metadata.appliedRendererNames, VideoRenderer.NAME)) {
      targets.forEach(target => target.remove());
      return context;
    }
    const image = AssetUtils.findAsset(context.assets, AssetTypes.IMAGE_URL);
    if (!image) return context;
    for (let target of targets) {
      target.src = image.img.url;
      context.addFoundAssets(AssetUtils.mainImageOption(target.clientWidth, target.clientHeight))
    }
    context.metadata.applied(this.getName());
    context.events.impress(context);
    return context;
  }
  private selector(): string {
    return `img[${this.config.mainImage.selectorAttrName}]`;
  }
}
