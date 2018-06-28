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
import { ObserveRenderer } from "./ObserveRenderer";
import { isDefined } from "../../misc/TypeCheck";
import { getOrElse } from "../../misc/ObjectUtils";

export class VideoRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  static NAME = "VideoRenderer";
  getName(): string {
    return VideoRenderer.NAME;
  }
  depends(depend: RenderDependency): void {
    depend.before([ObserveRenderer.NAME]);
    depend.after([InjectRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
    if (!context.admNative || !context.admNative.link) return context;
    const target: HTMLElement =
      <HTMLElement>Dom.recursiveQuerySelector(context.element, this.selector());
    const video = AssetUtils.findAsset(context.assets, AssetTypes.VIDEO);
    const image = AssetUtils.findAsset(context.assets, AssetTypes.IMAGE_URL);
    if (!isDefined(target)) return context;
    if (!video) {
      target.remove();
      return context;
    }
    const VideoPlayerObjectName = this.config.video.videoPlayerObjectName;
    if (
      !(<any>window)[VideoPlayerObjectName] ||
      !(<any>window)[VideoPlayerObjectName].VideoPlayer
    ) {
      await this.loadVideoPlayer();
    }
    this.onVideoPlayerLoaded(target, video, image, context);
    return context;
  }
  private onVideoPlayerLoaded(element: HTMLElement, video: ResAssets, image: ResAssets, context: RendererContext) {
    const clickUrlWithExpandedParams: string = RendererUtils.addExpandParams(
      context.admNative.link.url,
      context.model.option.expandedClickParams
    );

    const vimp = context.events.vimp;
    context.events.vimp = () => { }; // force undertake.
    const player = new (<any>window)[this.config.video.videoPlayerObjectName].VideoPlayer(
      video.video.vasttag,
      element,
      function() { player.play(); },
      function() { },
      clickUrlWithExpandedParams,
      (!!image && !!image.img) ? image.img.url : void 0,
      context.environment.hasNativeBridge ? function() {
        const appId = getOrElse(() => context.bid.ext.appId);
        const clickUrlWithPlayCount = RendererUtils.addExpandParams(clickUrlWithExpandedParams, [{
          name: "video_play_nth",
          value: player.getPlayCount() || 0
        }]);
        context.environment.nativeBridge.open(clickUrlWithPlayCount, appId);
      } : void 0,
      context.model.option.video,
      onContinuousVideoPlayHandler(2000, () => {
        vimp(context);
      }),
      () => {
        setTimeout(() => {
          context.events.expired(context);
        }, context.model.option.video.replayDelayMillis);
      }
    );
    player.load();
    context.metadata.applied(this.getName(), { player });
    context.events.impress(context);
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