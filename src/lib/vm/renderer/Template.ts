import { getOrElse, nonEmpties } from "../../misc/ObjectUtils";
import { Dom } from "../../misc/Dom";

export class TemplateOps {
  constructor(
    private templates: { [id: string]: string },
    private templateSelectorAttr: string
  ) { }
  async resolveTemplate(...ids: string[]): Promise<string | undefined> {
    ids = nonEmpties(ids);
    for (let id of ids) {
      const externals =
        nonEmpties(await Promise.all(ids.map(id => this.resolveExternalTemplate(id))));
      if (externals.length > 0) {
        return externals[0];
      }
      if (this.templates[id]) {
        return this.templates[id];
      }
    }
    return Promise.resolve(void 0);
  }
  async resolveExternalTemplate(qualifier: string): Promise<string | undefined> {
    const query = `[${this.templateSelectorAttr}="${qualifier}"],#${qualifier}`;
    const topDocument = (await Dom.TopLevelWindow).document;
    const templateEl: Element = <Element>getOrElse(() => Dom.recursiveQuerySelector(topDocument, query));
    if (templateEl) {
      return templateEl.innerHTML;
    }
    return void 0;
  }
}
