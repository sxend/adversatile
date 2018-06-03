import Configuration from "./Configuration";
import * as handlebars from "handlebars";
import { link } from "fs";

class Macro {
  constructor(private configuration: Configuration) {
  }
  async applyTemplate(template: string, data: any): Promise<string> {
    return handlebars.compile(template)(data);
  }
  async applyElement(element: HTMLElement, data?: any): Promise<void> {
    await this.applyLinkMacro(element, data);
  }
  private async applyLinkMacro(element: HTMLElement, data?: any) {
    const links: HTMLAnchorElement[] = [].slice.call(element.querySelectorAll('a[data-adv-link]'));
    if (links.length === 0) return;
    if (!data || !data.payload || !data.payload.link) return;
    for (let link of links) {
      link.href = data.payload.link.url;
    }
  }
}
export default Macro;
