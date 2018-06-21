import { MacroContext, MacroProps, MacroOps } from "./renderer/Macro";
import { TemplateOps } from "./renderer/Template";
import { RendererConf } from "../Configuration";
import { ElementModel } from "../vm/ElementModel";
import { OpenRTB } from "../openrtb/OpenRTB";

export class Renderer {
  constructor(
    private config: RendererConf,
    private macroOps: MacroOps,
    private templateOps: TemplateOps,
  ) {
    this.config.plugins.forEach(plugin => plugin.install(this));
  }
  async render(context: RendererContext): Promise<void> {
    context.props.render(context);
    let template = await this.templateOps.resolveTemplate(
      context.model.useTemplate,
      context.model.qualifier,
      context.model.name) || "";
    let macroContext = new MacroContext(
      context.model,
      context.element,
      context.props,
      template,
      context.bid
    );
    await this.macroOps.applyMacro(macroContext);
    context.props.rendered(context);
  }
}
export interface RendererContext {
  model: ElementModel,
  element: HTMLElement,
  bid: OpenRTB.Bid;
  props: RenderProps;
}
export interface RenderProps extends MacroProps {
  render: (context: RendererContext) => void
  rendered: (context: RendererContext) => void
}
