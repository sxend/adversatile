import { getOrElse, containsOr } from "../../misc/ObjectUtils";
import { RendererContext, Renderer } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { VideoRenderer } from "./VideoRenderer";
import { MarkupVideoRenderer } from "./MarkupVideoRenderer";
import { RendererUtils } from "./RendererUtils";
import { nano } from "../../misc/StringUtils";

export class LinkRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  getName(): string {
    return "LinkRenderer";
  }
  async render(context: RendererContext): Promise<RendererContext> {
    if (containsOr(context.metadata.appliedRendererNames,
      VideoRenderer.NAME,
      MarkupVideoRenderer.NAME)) {
      return context;
    }
    if (!context.admNative || !context.admNative.link) return context;
    const link = context.admNative.link;
    const appId = getOrElse(() => context.bid.ext.appId);
    const selector = this.selector();
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, selector);
    if (targets.length === 0) return context;
    const clickUrl: string = RendererUtils.addExpandParams(
      link.url,
      context.model.option.expandedClickParams
    );
    for (let target of targets) {
      const anchor: HTMLAnchorElement = document.createElement("a");
      if (!!context.props.onClickForSDKBridge) {
        anchor.onclick = () => {
          const passingAppId: string | null = appId;
          context.props.onClickForSDKBridge(clickUrl, passingAppId);
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
    context.metadata.applied(this.getName());
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
