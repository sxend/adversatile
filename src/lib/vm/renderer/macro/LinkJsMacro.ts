import { Macro, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { MacroUtils } from "./MacroUtils";
import { Tracking } from "../../../misc/Tracking";
import { Dom } from "../../../misc/Dom";
import { containsOr } from "../../../misc/ObjectUtils";
import { VideoMacro } from "./VideoMacro";
import { MarkupVideoMacro } from "./MarkupVideoMacro";

export class LinkJsMacro implements Macro {
  constructor(private config: MacroConf) { }
  getName(): string {
    return "LinkJsMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    if (containsOr(context.metadata.appliedMacroNames,
      VideoMacro.NAME,
      MarkupVideoMacro.NAME)) {
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
          window.location.href = MacroUtils.addExpandParams(
            linkUrl,
            expandedClickParams
          );
        } else if (openTarget === "top") {
          window.open(
            MacroUtils.addExpandParams(linkUrl, expandedClickParams),
            "_top"
          );
        } else {
          window.open(
            MacroUtils.addExpandParams(linkUrl, expandedClickParams),
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
