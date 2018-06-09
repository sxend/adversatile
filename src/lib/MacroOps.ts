import Configuration, { MacroConf } from "./Configuration";

export class MacroOps {
  private macroStack: Macro[];
  constructor(private config: MacroConf, private props: {
    useAssets: (...asset: number[]) => void
  }) {
    this.macroStack = [
      new LinkMacro(config, { useAssets: this.props.useAssets })
    ];
  }
  async applyTemplate(template: string, data: any): Promise<string> {
    return nano(template, data);
  }
  async applyElement(element: HTMLElement, data: any): Promise<void> {
    for (let macro of this.macroStack) {
      await macro.applyMacro(element, data);
    }
  }
}

/* Nano Templates - https://github.com/trix/nano */
function nano(template: string, data: any) {
  return template.replace(/\{\{([\w\.]*)\}\}/g, function(str, key) {
    try {
      var keys = key.split("."), v = data[keys.shift()];
      for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
      return (typeof v !== "undefined" && v !== null) ? v : "";
    } catch (e) {
    }
    return str;
  });
}

export interface Macro {
  applyMacro(element: HTMLElement, data: any): Promise<void>;
}

class LinkMacro implements Macro {
  constructor(private config: MacroConf, private props: {
    useAssets: (...asset: number[]) => void
  }) { }
  applyMacro(element: HTMLElement, data: any): Promise<void> {
    const selector = this.config.link.selector;
    const links: HTMLAnchorElement[] = [].slice.call(element.querySelectorAll(selector));
    if (links.length === 0) return Promise.resolve();
    this.props.useAssets(1);
    for (let link of links) {
      if (!data || !data.link || !data.link.url) continue;
      link.href = data.link.url;
    }
    return Promise.resolve();
  }
}