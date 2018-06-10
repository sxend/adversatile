import Configuration, { MacroConf, AssetOption } from "./Configuration";
import { nano } from "./misc/StringUtils";

export class MacroOps {
  constructor(private config: MacroConf, private props: {
    addAssetOptions: (...assets: AssetOption[]) => void
  }) {
  }
  async applyTemplate(template: string, data: any): Promise<string> {
    return nano(template, data);
  }
  async applyElement(element: HTMLElement, data: any): Promise<void> {
    for (let macro of this.macroStack(data)) {
      await macro.applyMacro(element, data);
    }
  }
  private macroStack(data: any): Macro[] {
    return [
      new LinkMacro(this.config, { addAssetOptions: this.props.addAssetOptions })
    ];
  }
}

export interface Macro {
  applyMacro(element: HTMLElement, data: any): Promise<void>;
}

class LinkMacro implements Macro {
  constructor(private config: MacroConf, private props: {
    addAssetOptions: (...asset: AssetOption[]) => void
  }) { }
  applyMacro(element: HTMLElement, data: any): Promise<void> {
    const selector = this.config.link.selector;
    const links: HTMLAnchorElement[] = [].slice.call(element.querySelectorAll(selector));
    if (links.length === 0) return Promise.resolve();
    for (let link of links) {
      if (!data || !data.link || !data.link.url) continue;
      link.href = data.link.url;
    }
    return Promise.resolve();
  }
}