import { MacroContext, MacroProps, MacroOps } from "./renderer/Macro";
import { TemplateOps } from "./renderer/Template";
import { ElementModelConf } from "../Configuration";
import { ElementModel } from "../vm/ElementModel";
import { getOrElse } from "../misc/ObjectUtils";
import { Async } from "../misc/Async";
import { OpenRTB } from "../openrtb/OpenRTB";

export class Renderer {
  private macroOps: MacroOps;
  private templateOps: TemplateOps;
  constructor(private model: ElementModel, private config: ElementModelConf) {
    this.macroOps = new MacroOps(this.config.macro);
    this.templateOps = new TemplateOps(
      this.config.templates,
      this.config.templateQualifierKey
    );
    config.renderer.plugins.forEach(plugin => plugin.install(this));
  }
  async render(context: RendererContext): Promise<void> {
    const template = (await this.templateOps.resolveTemplate(this.model.name)) ||
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
  }
  async observeEvent(context: RendererContext, macro: MacroContext) {
    if (this.model.option.isBanner()) {
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
}
