import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf, ObserveType } from "../../Configuration";
import { Async } from "../../misc/Async";
import { Dom } from "../../misc/Dom";
import { NanoTemplateRenderer } from "./NanoTemplateRenderer";
import { ObserveRenderer } from "./ObserveRenderer";
import INVIEW = ObserveType.INVIEW;

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
      context = await this.injectIframe(target, context);
    } else if (method === "sibling") {
      context = await this.injectSibling(target, context);
    } else {
      context = await this.injectInnerHTML(target, context);
    }
    context.metadata.applied(this.getName());
    return context;
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
    const oldelement = context.element;
    context.element = iframe.contentDocument.body;
    context.model.once("updated", () => {
      context.model.once("update", () => {
        oldelement.textContent = "";
      });
    });
    ObserveRenderer.setObserveAttribute(
      iframe, INVIEW, this.config,
      context, () => context.props.vimp(context.bid));
    return context;
  }
  private async injectInnerHTML(target: HTMLElement, context: RendererContext): Promise<RendererContext> {
    target.innerHTML = context.template;
    context.model.once("updated", () => {
      context.model.once("update", () => {
        context.element.textContent = "";
      });
    });
    ObserveRenderer.setObserveAttribute(
      target, INVIEW, this.config, context,
      () => context.props.vimp(context.bid));
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
    ObserveRenderer.setObserveAttribute(
      childNodes[0], INVIEW, this.config, context,
      () => context.props.vimp(context.bid));
    return context;
  }

}
