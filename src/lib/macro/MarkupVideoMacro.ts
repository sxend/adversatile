import { Macro } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";

export class MarkupVideoMacro implements Macro {
  constructor(
    private config: MacroConf,
    private props: {
      trackingCall: (urls: string[], trackingName: string) => Promise<void>;
    }
  ) {}
  getName(): string {
    return "MarkupVideoMacro";
  }
  async applyMacro(element: HTMLElement, data: any): Promise<void> {
    if (!data || !data.asset || !data.asset.data || !data.asset.data.value)
      return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      const divChildElement: HTMLElement = document.createElement("div");
      divChildElement.className = target.className;
      divChildElement.id = this.config.markupVideo.markedId;
      while (target.firstChild) {
        target.removeChild(target.firstChild);
      }
      target.appendChild(divChildElement);
      divChildElement.innerHTML = data.asset.data.value;
      divChildElement.onclick = () => {
        this.props.trackingCall([data.link.url], "click-track-beacon");
      };
      // fireScript(divChildElements); // FIXME fire inner script tag
    }
    return Promise.resolve();
  }
  private selector(): string {
    return `[${this.config.markupVideo.markedId}]`;
  }
}
