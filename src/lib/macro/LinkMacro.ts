import { Macro, MacroProps, MacroContext } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import ResAssets = OpenRTB.NativeAd.Response.Assets;
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { resultOrElse } from "../misc/ObjectUtils";

export class LinkMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "LinkMacro";
  }
  async applyMacro(element: HTMLElement, context: MacroContext): Promise<void> {
    if (!context.admNative || !context.admNative.link) return;
    const link = context.admNative.link;
    const appId = resultOrElse(() => context.bid.ext.appId);
    const selector = this.selector();
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(selector)
    );
    if (targets.length === 0) return Promise.resolve();
    const clickUrl: string = MacroUtils.addExpandParams(
      link.url,
      context.model.option.expandedClickParams
    );
    for (let target of targets) {
      const anchor: HTMLAnchorElement = document.createElement("a");
      if (!!this.props.onClickForSDKBridge) {
        anchor.onclick = () => {
          const passingAppId: string | null = appId;
          this.props.onClickForSDKBridge(clickUrl, passingAppId);
        };
      } else {
        const urlFormat = target.getAttribute(this.config.link.selectorAttrName);
        const nanoContext = {
          [this.config.link.urlPlaceholder]: clickUrl,
          [this.config.link.encodedUrlPlaceholder]: encodeURIComponent(clickUrl)
        };
        anchor.href = urlFormat === "" ? clickUrl : nano(urlFormat, nanoContext);
      }
      anchor.target = this.detectAnchorTarget(target);
      anchor.classList.add(this.config.link.anchorMarkedClass);
      if (target.parentElement) {
        target.parentElement.insertBefore(anchor, target);
      }
      target.classList.add(this.config.link.markedClass);
      anchor.appendChild(target);
    }
    return Promise.resolve();
  }
  private selector(): string {
    const selector = this.config.link.selectorAttrName;
    const markedClass = this.config.link.markedClass;
    return `[${selector}]:not(.${markedClass})`;
  }
  private detectAnchorTarget(element: HTMLElement): string {
    const targetAttr = element.querySelector(
      `[${this.config.link.anchorTargetAttrName}]`
    );
    if (targetAttr) {
      return targetAttr.getAttribute(this.config.link.anchorTargetAttrName);
    } else if (Dom.isInIframe(window)) {
      return "_top";
    } else {
      return "_blank";
    }
  }
}
