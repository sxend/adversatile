import { Macro, MacroContext } from "../../../vm/renderer/Macro";
import { nano } from "../../../misc/StringUtils";

export class NanoTemplateMacro implements Macro {
  constructor() { }
  getName(): string {
    return "NanoTemplateMacro";
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    context.template = nano(context.template || "", context);
    return context;
  }
}