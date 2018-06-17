import { MacroContext, MacroProps, MacroOps } from "./renderer/Macro";
import { TemplateOps } from "./renderer/Template";
import { RendererConf } from "../Configuration";
import { ElementModel } from "../vm/ElementModel";
import { getOrElse } from "../misc/ObjectUtils";
import { Async } from "../misc/Async";
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
    const template = (await this.templateOps.resolveTemplate(context.model.name)) ||
      getOrElse(() => context.bid.ext.bannerHtml);
    let macroContext = new MacroContext(
      context.model,
      context.element,
      context.props,
      template,
      context.bid
    );
    macroContext = await this.macroOps.applyMacro(macroContext);
    this.observeEvent(context, macroContext);
    context.props.rendered(context);
  }
  async observeEvent(context: RendererContext, macro: MacroContext) {
    if (context.model.option.isBanner()) {
      Async.wait(() => !!macro.element.querySelector("img"), 50).then(_ => {
        context.props.impress();
      });
    }
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
