import { nano } from "../../misc/StringUtils";
import { RendererContext, Renderer, RenderDependency } from "../Renderer";


export class NanoTemplateRenderer implements Renderer {
  constructor() { }
  getName(): string {
    return "NanoTemplateRenderer";
  }
  depends(_: RenderDependency): void { }
  async render(context: RendererContext): Promise<RendererContext> {
    context.template = nano(context.template || "", context);
    return context;
  }
}