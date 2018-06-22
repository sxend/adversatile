import { Renderer, RenderDependency, RendererContext } from "../Renderer";
import { RendererConf, ObserveType } from "../../Configuration";
import { Dom } from "../../misc/Dom";


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
    if (targets.length === 0) return context;
    const canInview = await Dom.canViewportIntersectionMeasurement;
    for (let target of targets) {
      const type = target.getAttribute(this.config.observe.observeTypeAttrName);
      if (type === String(ObserveType.INVIEW) && canInview) {
        this.observeInview(target, context);
      }
    }
    return context;
  }
  private async observeInview(target: HTMLElement, context: RendererContext) {
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
          threshold: Array(101).fill(0).map((_, i) => i / 100)
        }
      );
      observer.observe(target);
    });
  }
  private selector(id: string): string {
    return `[${this.config.observe.selectorAttrName}="${id}"][${this.config.observe.observeTypeAttrName}]`;
  }
}