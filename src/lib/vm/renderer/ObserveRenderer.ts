import { Renderer, RenderDependency, RendererContext } from "../Renderer";
import { RendererConf, ObserveType } from "../../Configuration";
import { Dom } from "../../misc/Dom";
import { RandomId } from "../../misc/RandomId";
import { Async } from "../../misc/Async";
import { ViewableObserver } from "../../misc/ViewableObserver";
import { isEmptyArray } from "../../misc/TypeCheck";

export class ObserveRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  static NAME = "ObserveRenderer";
  getName(): string {
    return ObserveRenderer.NAME;
  }
  depends(_: RenderDependency): void { }
  async render(context: RendererContext): Promise<RendererContext> {
    const timer = setInterval(() => this.scan(context), this.config.observe.scanInterval);
    context.element.model.once("update", () => clearInterval(timer));
    await this.scan(context);
    return context;
  }
  private async scan(context: RendererContext): Promise<void> {
    const topWindow = await Dom.TopLevelWindow;
    const targets = <HTMLElement[]>Dom.recursiveQuerySelectorAll(topWindow.document, this.selector(context.id));
    if (isEmptyArray(targets)) return;
    const canInview = await Dom.canViewportIntersectionMeasurement;
    for (let target of targets) {
      target.classList.add(this.config.observe.observeMarkedClass);
      const type = target.getAttribute(this.config.observe.observeTypeAttrName);
      const callbackId = target.getAttribute(this.config.observe.observeCallbackAttrName);
      const callback = <Function>(<any>topWindow)[callbackId];
      if (type === String(ObserveType.INVIEW) && canInview) {
        this.observeInview(target, callback);
      } else if (type === String(ObserveType.SELECTOR)) {
        this.observeSelector(target, callback);
      }
    }
    context.metadata.applied(this.getName());
  }
  private async observeInview(target: HTMLElement, callback: Function = () => { }) {
    ViewableObserver.onceInview(target, () => {
      callback();
    });
  }
  private async observeSelector(target: HTMLElement, callback: Function = () => { }) {
    const selector = target.getAttribute(this.config.observe.selector.observeSelectorAttrName);
    let elements: Node[];
    Async.wait(() => {
      elements = Dom.recursiveQuerySelectorAll(target, selector);
      return elements.length > 0;
    }, 50).then(_ => {
      callback(elements);
    });
  }
  private selector(id: string): string {
    return `[${this.config.observe.selectorAttrName}="${id}"][${this.config.observe.observeTypeAttrName}]:not(.${this.config.observe.observeMarkedClass})`;
  }
  static setObserveAttribute(
    element: Element,
    type: ObserveType,
    config: RendererConf,
    context: RendererContext,
    callback: () => void
  ) {
    element.setAttribute(config.observe.selectorAttrName, context.id);
    element.setAttribute(config.observe.observeTypeAttrName, String(type));
    const callbackId = RandomId.gen(`__adv_ob_rend`);
    element.setAttribute(config.observe.observeCallbackAttrName, callbackId);
    Dom.setTopWindowCallback(callbackId, callback);
  }
}