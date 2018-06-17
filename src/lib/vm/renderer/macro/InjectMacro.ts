import { Macro, MacroContext } from "../../../vm/renderer/Macro";
import { MacroConf } from "../../../Configuration";
import { Async } from "../../../misc/Async";
import { Dom } from "../../../misc/Dom";

export class InjectMacro implements Macro {
  constructor(private config: MacroConf) { }
  getName(): string {
    return "InjectMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    const attrName = this.config.inject.selectorAttrName;

    let target: HTMLElement = context.element;
    let method: string = context.model.option.macro.injectMethod;
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
      style: context.model.option.macro.injectedIframeStyle,
      width: context.bid.w.toString(),
      height: context.bid.h.toString(),
      scrolling: context.model.option.macro.injectedIframeScrolling
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
    this.observeInview(iframe, context);
    return context;
  }
  private async injectInnerHTML(target: HTMLElement, context: MacroContext): Promise<MacroContext> {
    target.innerHTML = context.template;
    this.observeInview(target, context);
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
    this.observeInview(childNodes[0], context);
    return context;
  }
  private async observeInview(target: Element, context: MacroContext) {
    if (!await Dom.canViewportIntersectionMeasurement) return;
    if (await Dom.isInIframe(window)) {
      target = window.frameElement;
    }
    context.model.once("rendered", async () => {
      let timer: any;
      const observer = new IntersectionObserver(
        function(event) {
          if (!event || !event[0]) return;
          if (event[0].intersectionRatio < 0.5) {
            if (timer) {
              clearTimeout(timer);
              timer = null;
            }
          } else {
            if (!timer) {
              timer = setTimeout(() => {
                context.props.vimp(context.bid);
                observer.unobserve(target);
              }, 1000);
            }
          }
        },
        {
          // root: window.document.documentElement,
          threshold: Array(101).fill(0).map((_, i) => i / 100)
        }
      );
      observer.observe(target);
    });
  }
}
