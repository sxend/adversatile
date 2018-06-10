import { Macro, MacroProps } from "../MacroOps";
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
  async applyMacro(element: HTMLElement, context: any): Promise<void> {
    const linkUrl = resultOrElse(() => context.bid.ext.admNative.link.url);
    const appId = resultOrElse(() => context.bid.ext.appId);
    const expandParams = resultOrElse(() => context.expandParams);
    if (!linkUrl) return;
    const selector = this.selector();
    const links: HTMLElement[] = [].slice.call(
      element.querySelectorAll(selector)
    );
    if (links.length === 0) return Promise.resolve();
    const clickUrl: string = MacroUtils.addExpandParams(
      linkUrl,
      expandParams
    );
    for (let link of links) {
      const anchor: HTMLAnchorElement = document.createElement("a");
      if (!!this.props.onClickForSDKBridge) {
        anchor.onclick = () => {
          const passingAppId: string | null = appId;
          this.props.onClickForSDKBridge(clickUrl, passingAppId);
        };
      } else {
        const urlFormat = link.getAttribute(this.config.link.selectorAttrName);
        const nanoContext = {
          [this.config.link.urlPlaceholder]: clickUrl,
          [this.config.link.encodedUrlPlaceholder]: encodeURIComponent(clickUrl)
        };
        anchor.href = urlFormat === "" ? clickUrl : nano(urlFormat, nanoContext);
      }
      anchor.target = this.detectAnchorTarget(link);
      anchor.classList.add(this.config.link.anchorMarkedClass);
      if (link.parentElement) {
        link.parentElement.insertBefore(anchor, link);
      }
      link.classList.add(this.config.link.markedClass);
      anchor.appendChild(link);
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
