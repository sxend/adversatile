import { Macro } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";

export class LinkMacro implements Macro {
  constructor(
    private config: MacroConf,
    private props: {
      addAssetOptions: (...asset: AssetOption[]) => void;
      trackingCall: (urls: string[], trackingName: string) => Promise<void>;
    }
  ) {}
  async applyMacro(element: HTMLElement, data: any): Promise<void> {
    if (!data || !data.link || !data.link.url || !data.link.clktrck) return;
    const selector = this.selector();
    const links: HTMLAnchorElement[] = [].slice.call(
      element.querySelectorAll(selector)
    );
    if (links.length === 0) return Promise.resolve();
    for (let link of links) {
      link.style.cursor = "auto";
      link.onclick = async () => {
        await this.props.trackingCall(data.link.clktrck, "click-track-beacon");
        const openTarget = link.getAttribute(this.config.linkJs.openTargetAttrName);
        if (openTarget === "self") {
          window.location.href = MacroUtils.addExpandParams(
            data.link.url,
            data.expandParams
          );
        } else if (openTarget === "top") {
          window.open(
            MacroUtils.addExpandParams(data.link.url, data.expandParams),
            "_top"
          );
        } else {
          window.open(
            MacroUtils.addExpandParams(data.link.url, data.expandParams),
            "_blank"
          );
        }
        return false;
      };
    }
  }
  private selector(): string {
    const selector = this.config.linkJs.selectorAttrName;
    return `[${selector}]`;
  }
}
