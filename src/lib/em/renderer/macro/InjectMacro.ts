import { Macro, MacroContext } from "../../../em/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { Async } from "../../../misc/Async";

export class InjectMacro implements Macro {
  constructor(private config: MacroConf) { }
  getName(): string {
    return "InjectMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    const attrName = this.config.inject.selectorAttrName;

    let target: HTMLElement = context.element;
    let method: string = context.model.option.injectMethod;
    if (context.element.getAttribute(attrName)) {
      target = context.element;
      method = context.element.getAttribute(attrName);
    }
    const child = context.element.querySelector(`[${attrName}]`);
    if (child) {
      target = <HTMLElement>child;
      method = child.getAttribute(attrName);
    }
    if (method === "iframe") {
      return this.injectIframe(target, context);
    } else if (method === "sibling") {
      return this.injectSibling(target, context);
    } else {
      return this.injectInnerHTML(target, context);
    }
  }
  private async injectIframe(target: HTMLElement, context: MacroContext): Promise<MacroContext> {
    const iframe = document.createElement("iframe");
    const attributes: { [attr: string]: string } = {
      style: "display:block;margin:0 auto;border:0pt;",
      width: context.bid.w.toString(),
      height: context.bid.h.toString(),
      scrolling: "no"
    };
    Object.keys(attributes).forEach(attr => {
      iframe.setAttribute(attr, attributes[attr]);
    });
    target.appendChild(iframe);

    await Async.wait(() => !!iframe.contentDocument);
    try {
      iframe.contentDocument.open();
      iframe.contentDocument.write(context.template);
    } finally {
      iframe.contentDocument.close();
    }
    await Async.wait(() => !!iframe.contentDocument.body);
    context.element = iframe.contentDocument.body;
    return context;
  }
  private async injectInnerHTML(target: HTMLElement, context: MacroContext): Promise<MacroContext> {
    target.innerHTML = context.template;
    return context;
  }
  private async injectSibling(target: HTMLElement, context: MacroContext): Promise<MacroContext> {
    context = await this.injectInnerHTML(target, context);
    const childNodes = [].slice.call(target.childNodes);
    context.model.once("updated", () => {
      childNodes.forEach((node: Node) => {
        target.parentElement.insertBefore(node, target.nextSibling || target);
      });
      context.model.once("update", () => {
        childNodes.forEach((node: ChildNode) => node.remove());
      });
    });
    return context;
  }
}
