import { Macro, MacroProps } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { EventEmitter } from "events";

export class VideoMacro implements Macro {
  constructor(
    private config: MacroConf,
    private props: MacroProps
  ) { }
  getName(): string {
    return "VideoMacro";
  }
  async applyMacro(element: HTMLElement, data: any): Promise<void> {
    if (!data || !data.link || !data.link.url) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    const VideoPlayerObjectName = this.config.video.videoPlayerObjectName;
    if (!(<any>window)[VideoPlayerObjectName] || !(<any>window)[VideoPlayerObjectName].VideoPlayer) {
      await this.loadVideoPlayer();
    }
    for (let target of targets) {
      this.onVideoPlayerLoaded(target, data);
    }
    return Promise.resolve();
  }
  private onVideoPlayerLoaded(element: HTMLElement, data: any) {
    const mainImageAsset = data.assets.filter((a: OpenRTB.NativeAd.Response.Assets) => {
      return AssetUtils.getAssetByAssetId(a.id) === AssetTypes.IMAGE_URL
    })[0];
    const clickUrlWithExpandedParams: string = MacroUtils.addExpandParams(data.link.url, data.expandParams);
    let onVideoClickHandler: () => void = undefined;
    if (!!this.props.onClickForSDKBridge) {
      onVideoClickHandler = () => this.props.onClickForSDKBridge(
        clickUrlWithExpandedParams,
        data.appId);
    }

    const videoPlayerHandler = new VideoPlayerWrapper(element, data, {
      onImpression: () => this.props.onImpression(),
      onInview: () => this.props.onInview(),
      onClick: () => onVideoClickHandler()
    });

    videoPlayerHandler.render();
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
class VideoPlayerWrapper {
  constructor(private element: HTMLElement, private data: any, private props: {
    onImpression: () => void
    onInview: () => void
    onClick: () => void
  }) { }
  render() {
    // FIXME implement video player
    this.props.onImpression();
    setTimeout(() => {
      this.props.onInview();
    }, 2000);
    this.element.onclick = () => this.props.onClick();
  }
}
