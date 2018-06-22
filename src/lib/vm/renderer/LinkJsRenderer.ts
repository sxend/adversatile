import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { containsOr } from "../../misc/ObjectUtils";
import { VideoRenderer } from "./VideoRenderer";
import { MarkupVideoRenderer } from "./MarkupVideoRenderer";
import { Tracking } from "../../misc/Tracking";
import { RendererUtils } from "./RendererUtils";
import { InjectRenderer } from "./InjectRenderer";

export class LinkJsRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  static NAME = "LinkJsRenderer";
  getName(): string {
    return LinkJsRenderer.NAME;
  }
  depends(depend: RenderDependency): void {
    depend.after([InjectRenderer.NAME, VideoRenderer.NAME, MarkupVideoRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
    if (containsOr(context.metadata.appliedRendererNames,
      VideoRenderer.NAME,
      MarkupVideoRenderer.NAME)) {
      return context;
    }
    if (!context.admNative || !context.admNative.link) return context;
    const link = context.admNative.link;
    const linkUrl = link.url;
    const clktrckUrl = link.clktrck;
    if (!linkUrl || !clktrckUrl) return context;
    const selector = this.selector();
    const targets: HTMLElement[] =
      <HTMLElement[]>Dom.recursiveQuerySelectorAll(context.element, selector);

    if (targets.length === 0) return context;
    for (let target of targets) {
      target.style.cursor = "auto";
      target.onclick = async () => {
        await Tracking.trackingCall(clktrckUrl, "click-track-beacon");
        const openTarget = target.getAttribute(
          this.config.linkJs.openTargetAttrName
        );
        const expandedClickParams = context.model.option.expandedClickParams;
        if (openTarget === "self") {
          window.location.href = RendererUtils.addExpandParams(
            linkUrl,
            expandedClickParams
          );
        } else if (openTarget === "top") {
          window.open(
            RendererUtils.addExpandParams(linkUrl, expandedClickParams),
            "_top"
          );
        } else {
          window.open(
            RendererUtils.addExpandParams(linkUrl, expandedClickParams),
            "_blank"
          );
        }
        return false;
      };
    }
    context.metadata.applied(this.getName());
    return context;
  }
  private selector(): string {
    const selector = this.config.linkJs.selectorAttrName;
    return `[${selector}]`;
  }
}
