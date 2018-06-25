import { nano } from "../../misc/StringUtils";
import { RendererContext, Renderer, RenderDependency } from "../Renderer";


export class NanoTemplateRenderer implements Renderer {
  constructor() { }
  static NAME = "NanoTemplateRenderer";
  getName(): string {
    return NanoTemplateRenderer.NAME;
  }
  depends(_: RenderDependency): void { }
  async render(context: RendererContext): Promise<RendererContext> {
    context.template = nano(context.template || "", context);
    if (context.bannerHtml) {
      context.bid.ext.bannerHtml = nano(context.bannerHtml, context);
    }
    return context;
  }
}