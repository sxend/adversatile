import { Macro, MacroProps, MacroContext } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";
import { resultOrElse } from "../misc/ObjectUtils";

export class LinkJsMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "LinkJsMacro";
  }
  async applyMacro(element: HTMLElement, context: MacroContext): Promise<void> {
    if (!context.admNative || !context.admNative.link) return;
    const link = context.admNative.link;
    const linkUrl = link.url;
    const clktrckUrl = link.clktrck;
    if (!linkUrl || !clktrckUrl) return;
    const selector = this.selector();
    const links: HTMLElement[] = [].slice.call(
      element.querySelectorAll(selector)
    );
    if (links.length === 0) return Promise.resolve();
    for (let link of links) {
      link.style.cursor = "auto";
      link.onclick = async () => {
        await this.props.trackingCall(clktrckUrl, "click-track-beacon");
        const openTarget = link.getAttribute(
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
    return Promise.resolve();
  }
  private selector(): string {
    const selector = this.config.linkJs.selectorAttrName;
    return `[${selector}]`;
  }
}
