import Configuration from "./Configuration";
import * as handlebars from "handlebars";
import { link } from "fs";

class Macro {
  constructor(private configuration: Configuration) {
  }
  get macroConf() {
    return this.configuration.vm.em.macro;
  }
  async applyTemplate(template: string, data: any): Promise<string> {
    return handlebars.compile(template)(data);
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
export default Macro;
