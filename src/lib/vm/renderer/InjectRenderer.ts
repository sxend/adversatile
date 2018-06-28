import { RendererContext, Renderer, RenderDependency } from "../Renderer";
import { RendererConf, ObserveType } from "../../Configuration";
import { Async } from "../../misc/Async";
import { NanoTemplateRenderer } from "./NanoTemplateRenderer";
import { ObserveRenderer } from "./ObserveRenderer";
import INVIEW = ObserveType.INVIEW;
import SELECTOR = ObserveType.SELECTOR;
import { getOrElse } from "../../misc/ObjectUtils";
import { isDefined } from "../../misc/TypeCheck";

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
    let injectMethod: string = context.model.option.renderer.injectMethod;

    if (context.model.option.isBanner()) {
      context.template = context.template || getOrElse(() => context.bid.ext.bannerHtml);
    } else if (context.filler) {
      context.template = context.filler;
      injectMethod = "iframe";
    }
    if (!context.template) return context;

    if (injectMethod === "iframe") {
      context = await this.injectIframe(context);
    } else if (injectMethod === "sibling") {
      context = await this.injectSibling(context);
    } else {
      context = await this.injectInnerHTML(context);
    }

    if (context.model.option.isBanner()) {
      context.element.setAttribute(this.config.observe.selector.observeSelectorAttrName, this.config.inject.bannerAdImpSelector);
      ObserveRenderer.setObserveAttribute(
        context.element, SELECTOR, this.config,
        context, () => context.events.impress(context.bid));
    }
    context.metadata.applied(this.getName());
    return context;
  }
  private async injectIframe(context: RendererContext): Promise<RendererContext> {
    const iframe = document.createElement("iframe");
    const attributes: { [attr: string]: string } = {
      style: context.model.option.renderer.injectedIframeStyle,
      width: isDefined(context.bid.w) ? context.bid.w.toString() : void 0,
      height: isDefined(context.bid.h) ? context.bid.h.toString() : void 0,
      scrolling: context.model.option.renderer.injectedIframeScrolling,
      frameborder: context.model.option.renderer.injectedIframeFrameBorder
    };
    Object.keys(attributes).forEach(attr => {
      iframe.setAttribute(attr, attributes[attr]);
    });
    context.element.appendChild(iframe);

    await Async.wait(() => !!iframe.contentDocument);
    try {
      iframe.contentDocument.open();
      iframe.contentDocument.write(context.template);
    } finally {
      iframe.contentDocument.close();
    }
    await Async.wait(() => !!iframe.contentDocument.body);
    context.element = iframe.contentDocument.body;
    this.setObserveInview(iframe, context);
    return context;
  }
  private async injectInnerHTML(context: RendererContext): Promise<RendererContext> {
    context.element.innerHTML = context.template;
    this.setObserveInview(context.element, context);
    return context;
  }
  private async injectSibling(context: RendererContext): Promise<RendererContext> {
    context = await this.injectInnerHTML(context);
    const childNodes = [].slice.call(context.element.childNodes);
    context.model.once("updated", () => {
      childNodes.forEach((node: Node) => {
        context.element.parentElement.insertBefore(node, context.element.nextSibling || context.element);
      });
      context.model.once("update", () => {
        childNodes.forEach((node: ChildNode) => node.remove());
      });
    });
    this.setObserveInview(childNodes[0], context);
    return context;
  }
  private setObserveInview(target: HTMLElement, context: RendererContext) {
    ObserveRenderer.setObserveAttribute(
      target, INVIEW, this.config, context,
      () => context.events.vimp(context.bid));
  }
}
