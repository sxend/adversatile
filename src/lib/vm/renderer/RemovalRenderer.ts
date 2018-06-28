import { Renderer, RenderDependency, RendererContext } from "../Renderer";
import { RendererConf } from "../../Configuration";
import { InjectRenderer } from "./InjectRenderer";
import { ObserveRenderer } from "./ObserveRenderer";

export class RemovalRenderer implements Renderer {
  constructor(_config: RendererConf) { }
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
    context.metadata.applied(this.getName());
    return context;
  }
}