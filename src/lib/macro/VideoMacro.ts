import { Macro, MacroProps, MacroContext } from "../MacroOps";
import { MacroConf } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { resultOrElse } from "../misc/ObjectUtils";

export class VideoMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "VideoMacro";
  }
  async applyMacro(element: HTMLElement, context: MacroContext): Promise<void> {
    if (!context.admNative || !context.admNative.link) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    const VideoPlayerObjectName = this.config.video.videoPlayerObjectName;
    if (
      !(<any>window)[VideoPlayerObjectName] ||
      !(<any>window)[VideoPlayerObjectName].VideoPlayer
    ) {
      await this.loadVideoPlayer();
    }
    for (let target of targets) {
      this.onVideoPlayerLoaded(target, context);
    }
    return Promise.resolve();
  }
  private onVideoPlayerLoaded(element: HTMLElement, context: MacroContext) {
    const video = AssetUtils.findAsset(context.assets, AssetTypes.VIDEO);
    const image = AssetUtils.findAsset(context.assets, AssetTypes.IMAGE_URL);
    if (!video) return;

    const clickUrlWithExpandedParams: string = MacroUtils.addExpandParams(
      context.admNative.link.url,
      context.model.option.expandedClickParams
    );
    let onVideoClickHandler: () => void = undefined;
    if (!!this.props.onClickForSDKBridge) {
      onVideoClickHandler = () =>
        this.props.onClickForSDKBridge(clickUrlWithExpandedParams, resultOrElse(() => context.bid.ext.appId));
    }
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
        context.props.vimp();
      }),
      () => context.model.emit("video complete")
    );
    player.load();
    context.props.impress()
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