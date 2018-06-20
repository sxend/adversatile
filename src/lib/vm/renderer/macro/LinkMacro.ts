import { Macro, MacroProps, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../../../misc/StringUtils";
import { Dom } from "../../../misc/Dom";
import { getOrElse } from "../../../misc/ObjectUtils";

export class LinkMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "LinkMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    if (!context.admNative || !context.admNative.link) return context;
    const link = context.admNative.link;
    const appId = getOrElse(() => context.bid.ext.appId);
    const selector = this.selector();
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, selector);
    if (targets.length === 0) return context;
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
    return context;
  }
  private selector(): string {
    const selector = this.config.link.selectorAttrName;
    const markedClass = this.config.link.markedClass;
    return `[${selector}]:not(.${markedClass})`;
  }
  private detectAnchorTarget(element: HTMLElement): string {
    const targetAttr = <Element>Dom.recursiveQuerySelector(
      element,
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
