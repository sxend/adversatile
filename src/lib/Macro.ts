import Configuration from "./Configuration";

class Macro {
  constructor(private configuration: Configuration) {
  }
  get macroConf() {
    return this.configuration.vm.em.macro;
  }
  async applyTemplate(template: string, data: any): Promise<string> {
    return nano(template, data);
  }
  async applyElement(element: HTMLElement, data: any): Promise<void> {
    await this.applyLinkMacro(element, data)
  }
  private async applyLinkMacro(element: HTMLElement, data: any) {
    const linkMacroSelector = this.macroConf.linkMacroSelector;
    const links: HTMLAnchorElement[] = [].slice.call(element.querySelectorAll(linkMacroSelector));
    for (let link of links) {
      this.annotateUsedMacro(link, "link");
      if (!data || !data.link || !data.link.url) continue;
      link.href = data.link.url;
    }
  }
  private annotateUsedMacro(element: HTMLElement, name: string) {
    element.setAttribute(this.macroConf.appliedMacroAnnotateAttr, name);
  }
  getAppliedMacros(element: HTMLElement): string[] {
    return [].slice.call(
      element.querySelectorAll(`[${this.macroConf.appliedMacroAnnotateAttr}]`)
    ).map((el: HTMLElement) => el.getAttribute(this.macroConf.appliedMacroAnnotateAttr))
      .filter((_: string) => !!_);
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

export default Macro;
