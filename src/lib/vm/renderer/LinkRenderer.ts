import { getOrElse, contains } from "../../misc/ObjectUtils";
import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { VideoRenderer } from "./VideoRenderer";
import { MarkupVideoRenderer } from "./MarkupVideoRenderer";
import { RendererUtils } from "./RendererUtils";
import { nano } from "../../misc/StringUtils";
import { InjectRenderer } from "./InjectRenderer";
import { isEmptyArray, isDefined } from "../../misc/TypeCheck";

export class LinkRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  static NAME = "LinkRenderer";
  getName(): string {
    return LinkRenderer.NAME;
  }
  depends(depend: RenderDependency): void {
    depend.after([InjectRenderer.NAME, VideoRenderer.NAME, MarkupVideoRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
    if (!context.admNative || !context.admNative.link) return context;
    const link = context.admNative.link;
    const selector = this.selector();
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element.target, selector);
    if (isEmptyArray(targets)) return context;
    const clickUrl: string = RendererUtils.addExpandParams(
      link.url,
      context.element.option.expandedClickParams
    );
    const appId = getOrElse(() => context.bid.ext.appId);
    for (let target of targets) {
      const anchor: HTMLAnchorElement = document.createElement("a");
      anchor.target = this.detectAnchorTarget(target);
      if (context.environment.hasNativeBridge) {
        anchor.onclick = () => {
          context.events.click(context);
          context.environment.nativeBridge.open(clickUrl, appId);
        };
      } else if (contains(context.metadata.appliedRendererNames, VideoRenderer.NAME)) {
        anchor.onclick = () => {
          context.events.click(context);
          let clickUrlWithPlayCount: string;
          const videoAttachment = context.metadata.appliedRendererAttachments[VideoRenderer.NAME];
          if (isDefined(videoAttachment)) {
            clickUrlWithPlayCount = RendererUtils.addExpandParams(clickUrl, [{
              name: "video_play_nth",
              value: videoAttachment.players[0].getPlayCount() || 0
            }]);
          } else {
            clickUrlWithPlayCount = clickUrl;
          }
          if (anchor.target === '_self') {
            window.location.href = clickUrlWithPlayCount;
          } else {
            window.open(clickUrlWithPlayCount, anchor.target);
          }
        };
      } else {
        const urlFormat = target.getAttribute(this.config.link.selectorAttrName);
        const nanoContext = {
          [this.config.link.urlPlaceholder]: clickUrl,
          [this.config.link.encodedUrlPlaceholder]: encodeURIComponent(clickUrl)
        };
        anchor.href = urlFormat === "" ? clickUrl : nano(urlFormat, nanoContext);
      }

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
