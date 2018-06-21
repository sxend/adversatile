import { Macro, MacroProps, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { MacroUtils } from "./MacroUtils";
import { OpenRTB } from "../../../openrtb/OpenRTB";
import { AssetUtils } from "../../../openrtb/AssetUtils";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { getOrElse } from "../../../misc/ObjectUtils";
import { Dom } from "../../../misc/Dom";

export class VideoMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  static NAME: "VideoMacro";
  getName(): string {
    return VideoMacro.NAME;
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    if (!context.admNative || !context.admNative.link) return context;
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, this.selector());
    if (targets.length === 0) return context;
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
    return context;
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
        this.props.onClickForSDKBridge(clickUrlWithExpandedParams, getOrElse(() => context.bid.ext.appId));
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