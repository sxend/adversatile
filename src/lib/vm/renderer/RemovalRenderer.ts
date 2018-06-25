import { Renderer, RenderDependency, RendererContext } from "../Renderer";
import { RendererConf, ObserveType } from "../../Configuration";
import { InjectRenderer } from "./InjectRenderer";
import { ObserveRenderer } from "./ObserveRenderer";
import { Dom } from "../../misc/Dom";
import INVIEW = ObserveType.INVIEW;

export class RemovalRenderer implements Renderer {
  constructor(private config: RendererConf) { }
  static NAME = "RemovalRenderer";
  getName(): string {
    return RemovalRenderer.NAME;
  }
  depends(depend: RenderDependency): void {
    depend.before([InjectRenderer.NAME, ObserveRenderer.NAME]);
  }
  async render(context: RendererContext): Promise<RendererContext> {
    if (!context.bid || !context.bid.ext || !context.bid.ext.disabled) return context;
    context.element.textContent = "";
    context.template = "";
    const callback = () => {
      context.events.disabledAreaViewabled(context.bid);
    };
    if (await Dom.isInIframe(window)) {
      ObserveRenderer.setObserveAttribute(
        window.frameElement,
        INVIEW, this.config, context, callback);
    } else {
      ObserveRenderer.setObserveAttribute(
        <Element>context.element.parentNode,
        INVIEW, this.config, context, callback);
    }
    context.metadata.applied(this.getName());
    return context;
  }
}