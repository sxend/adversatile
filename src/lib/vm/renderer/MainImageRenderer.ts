import { RendererContext, Renderer } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { OpenRTB } from "../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../openrtb/AssetUtils";
import { contains } from "../../misc/ObjectUtils";
import { VideoRenderer } from "./VideoRenderer";

export class MainImageRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  getName(): string {
    return "MainImageRenderer";
  }
  async render(context: RendererContext): Promise<RendererContext> {
    const targets: HTMLImageElement[] =
      <HTMLImageElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
    if (contains(context.metadata.appliedRendererNames, VideoRenderer.NAME)) {
      targets.forEach(target => target.remove());
      return context;
    }
    const image = AssetUtils.findAsset(context.assets, AssetTypes.IMAGE_URL);
    if (!image) return context;
    for (let target of targets) {
      target.src = image.img.url;
      context.props.findAssets(AssetUtils.mainImageOption(target.clientWidth, target.clientHeight))
    }
    context.metadata.applied(this.getName());
    context.props.impress(context.bid);
    return context;
  }
  private selector(): string {
    return `img[${this.config.mainImage.selectorAttrName}]`;
  }
}