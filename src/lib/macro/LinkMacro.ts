import { Macro, MacroProps } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";

export class LinkMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "LinkMacro";
  }
  async applyMacro(element: HTMLElement, data: any): Promise<void> {
    if (!data || !data.link || !data.link.url) return;
    const selector = this.selector();
    const links: HTMLElement[] = [].slice.call(
      element.querySelectorAll(selector)
    );
    if (links.length === 0) return Promise.resolve();
    const clickUrl: string = MacroUtils.addExpandParams(
      data.link.url,
      data.expandParams
    );
    for (let link of links) {
      const anchor: HTMLAnchorElement = document.createElement("a");
      if (!!this.props.onClickForSDKBridge) {
        anchor.onclick = () => {
          const passingAppId: string | null = !!data.appId ? data.appId : null;
          this.props.onClickForSDKBridge(clickUrl, passingAppId);
        };
      } else {
        const urlFormat = link.getAttribute(this.config.link.selectorAttrName);
        const context = {
          [this.config.link.urlPlaceholder]: clickUrl,
          [this.config.link.encodedUrlPlaceholder]: encodeURIComponent(clickUrl)
        };
        anchor.href = urlFormat === "" ? clickUrl : nano(urlFormat, context);
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
