import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf, ObserveType } from "../../Configuration";
import { Async } from "../../misc/Async";
import { Dom } from "../../misc/Dom";
import { NanoTemplateRenderer } from "./NanoTemplateRenderer";
import { ObserveRenderer } from "./ObserveRenderer";

export class InjectRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  static NAME = "InjectRenderer";
  getName(): string {
    return InjectRenderer.NAME;
  }
  depends(depend: RenderDependency): void {
    depend.before([ObserveRenderer.NAME]);
    depend.after([NanoTemplateRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
    const attrName = this.config.inject.selectorAttrName;

    let target: HTMLElement = context.element;
    let method: string = context.model.option.renderer.injectMethod;
    if (context.element.getAttribute(attrName)) {
      target = context.element;
      method = context.element.getAttribute(attrName);
    }
    const child = <HTMLElement>Dom.recursiveQuerySelector(context.element, `[${attrName}]`);
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
  private async injectIframe(target: HTMLElement, context: RendererContext): Promise<RendererContext> {
    const iframe = document.createElement("iframe");
    const attributes: { [attr: string]: string } = {
      style: context.model.option.renderer.injectedIframeStyle,
      width: context.bid.w !== void 0 ? context.bid.w.toString() : void 0,
      height: context.bid.h !== void 0 ? context.bid.h.toString() : void 0,
      scrolling: context.model.option.renderer.injectedIframeScrolling,
      frameborder: context.model.option.renderer.injectedIframeFrameBorder
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
    this.setObserveAttribute(iframe, context);
    return context;
  }
  private async injectInnerHTML(target: HTMLElement, context: RendererContext): Promise<RendererContext> {
    target.innerHTML = context.template;
    this.setObserveAttribute(target, context);
    return context;
  }
  private async injectSibling(target: HTMLElement, context: RendererContext): Promise<RendererContext> {
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
    this.setObserveAttribute(childNodes[0], context);
    return context;
  }
  private setObserveAttribute(element: HTMLElement, context: RendererContext) {
    element.setAttribute(this.config.observe.selectorAttrName, context.id);
    element.setAttribute(this.config.observe.observeTypeAttrName, String(ObserveType.INVIEW));
  }
}
