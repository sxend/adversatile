import { Macro, MacroProps } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";

export class MarkupVideoMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "MarkupVideoMacro";
  }
  async applyMacro(element: HTMLElement, context: any): Promise<void> {
    if (!context || !context.asset || !context.asset.data || !context.asset.data.value)
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
      divChildElement.innerHTML = context.asset.data.value;
      divChildElement.onclick = () => {
        this.props.trackingCall([context.link.url], "click-track-beacon");
      };
      // fireScript(divChildElements); // FIXME fire inner script tag
    }
    return Promise.resolve();
  }
  private selector(): string {
    return `[${this.config.markupVideo.markedId}]`;
  }
}
