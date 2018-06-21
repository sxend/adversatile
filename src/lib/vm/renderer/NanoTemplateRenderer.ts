import { nano } from "../../misc/StringUtils";
import { RendererContext, Renderer } from "../Renderer";


export class NanoTemplateRenderer implements Renderer {
  constructor() { }
  getName(): string {
    return "NanoTemplateRenderer";
  }
  async render(context: RendererContext): Promise<RendererContext> {
    context.template = nano(context.template || "", context);
    return context;
  }
}