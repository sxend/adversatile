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
    const topWindow = await Dom.TopLevelWindow;
    const targets = <HTMLElement[]>Dom.recursiveQuerySelectorAll(topWindow.document, this.selector(context.id));
    if (isEmptyArray(targets)) return context;
    const canInview = await Dom.canViewportIntersectionMeasurement;
    for (let target of targets) {
      const type = target.getAttribute(this.config.observe.observeTypeAttrName);
      const callbackId = target.getAttribute(this.config.observe.observeCallbackAttrName);
      const callback = <Function>(<any>topWindow)[callbackId];
      if (type === String(ObserveType.INVIEW) && canInview) {
        this.observeInview(target, context, callback);
      } else if (type === String(ObserveType.SELECTOR)) {
        this.observeSelector(target, context, callback);
      }
    }
    context.metadata.applied(this.getName());
    return context;
  }
  private async observeInview(target: HTMLElement, context: RendererContext, callback: Function = () => { }) {
    context.element.model.once("rendered", async () => {
      ViewableObserver.onceInview(target, () => {
        callback();
      });
    });
  }
  private async observeSelector(target: HTMLElement, context: RendererContext, callback: Function = () => { }) {
    context.element.model.once("rendered", async () => {
      const selector = target.getAttribute(this.config.observe.selector.observeSelectorAttrName);
      let elements: Node[];
      Async.wait(() => {
        elements = Dom.recursiveQuerySelectorAll(target, selector);
        return elements.length > 0;
      }, 50).then(_ => {
        callback(elements);
      });
    });
  }
  private selector(id: string): string {
    return `[${this.config.observe.selectorAttrName}="${id}"][${this.config.observe.observeTypeAttrName}]`;
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
    const callbackId = `__adv_ob_rend_${RandomId.gen()}`;
    element.setAttribute(config.observe.observeCallbackAttrName, callbackId);
    Dom.setTopWindowCallback(callbackId, callback);
  }
}