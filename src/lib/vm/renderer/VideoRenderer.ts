import { getOrElse } from "../../misc/ObjectUtils";
import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { OpenRTB } from "../../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { AssetUtils } from "../../openrtb/AssetUtils";
import Response = OpenRTB.NativeAd.Response;
import ResAssets = Response.Assets;
import { RendererUtils } from "./RendererUtils";
import { InjectRenderer } from "./InjectRenderer";

export class VideoRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  static NAME = "VideoRenderer";
  getName(): string {
    return VideoRenderer.NAME;
  }
  depends(depend: RenderDependency): void {
    depend.after([InjectRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
    if (!context.admNative || !context.admNative.link) return context;
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    const video = AssetUtils.findAsset(context.assets, AssetTypes.VIDEO);
    const image = AssetUtils.findAsset(context.assets, AssetTypes.IMAGE_URL);
    if (targets.length === 0) return context;
    if (!video) {
      targets.forEach(target => target.remove());
      return context;
    }
    const VideoPlayerObjectName = this.config.video.videoPlayerObjectName;
    if (
      !(<any>window)[VideoPlayerObjectName] ||
      !(<any>window)[VideoPlayerObjectName].VideoPlayer
    ) {
      await this.loadVideoPlayer();
    }
    for (let target of targets) {
      this.onVideoPlayerLoaded(target, video, image, context);
    }
    return context;
  }
  private onVideoPlayerLoaded(element: HTMLElement, video: ResAssets, image: ResAssets, context: RendererContext) {
    const clickUrlWithExpandedParams: string = RendererUtils.addExpandParams(
      context.admNative.link.url,
      context.model.option.expandedClickParams
    );
    let onVideoClickHandler: () => void = undefined;
    if (!!context.props.onClickForSDKBridge) {
      onVideoClickHandler = () =>
        context.props.onClickForSDKBridge(clickUrlWithExpandedParams, getOrElse(() => context.bid.ext.appId));
    }
    const vimp = context.props.vimp.lock();
    const player = new (<any>window)[this.config.video.videoPlayerObjectName].VideoPlayer(
      video.video.vasttag,
      element,
      function() { player.play(); },
      function() { },
      clickUrlWithExpandedParams,
      (!!image && !!image.img) ? image.img.url : void 0,
      onVideoClickHandler,
      context.model.option.video,
      onContinuousVideoPlayHandler(2000, () => {
        vimp(context.bid);
      }),
      () => context.model.emit("video complete")
    );
    player.load();
    context.metadata.applied(this.getName());
    context.props.impress(context.bid);
  }
  private loadVideoPlayer(): Promise<void> {
    return new Promise(resolve => {
      const videoJs = document.createElement("script");
      videoJs.async = true;
      videoJs.onload = () => resolve();
      videoJs.src = this.config.video.videoPlayerScriptUrl;
      document.body.appendChild(videoJs);
    });
  }
  private selector(): string {
    return `[${this.config.video.selectorAttrName}]`;
  }
}
function onContinuousVideoPlayHandler(seconds: number, callback: () => void): (state: number) => void {
  const STATE_PLAYING = 4; // state "4" is PlayingState.playing
  let finished = false;
  let timer: any;
  return (state: number) => {
    if (!finished) {
      if (state === STATE_PLAYING && !timer) {
        timer = setTimeout(() => {
          finished = true;
          callback();
        }, seconds);
      } else {
        clearTimeout(timer);
        timer = null;
      }
    }
  }
}