import Configuration, { MacroConf, AssetOption } from "./Configuration";
import { nano } from "./misc/StringUtils";
import { LinkMacro } from "./macro/LinkMacro";

export class MacroOps {
  constructor(private config: MacroConf, private props: {
    addAssetOptions: (...assets: AssetOption[]) => void
  }) {
  }
  async applyTemplate(template: string, data: any): Promise<string> {
    return nano(template, data);
  }
  async applyElement(element: HTMLElement, data: any, props: any): Promise<void> {
    for (let macro of this.macroStack(data, props)) {
      await macro.applyMacro(element, data);
    }
  }
  private macroStack(data: any, props: any): Macro[] {
    return [
      new LinkMacro(this.config, { addAssetOptions: props.addAssetOptions || this.props.addAssetOptions })
    ];
  }
}

export interface Macro {
  applyMacro(element: HTMLElement, data: any): Promise<void>;
}
