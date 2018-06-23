import { getOrElse, nonEmpties } from "../../misc/ObjectUtils";
import { Dom } from "../../misc/Dom";
import { ElementModelConf } from "../../Configuration";

export class TemplateOps {
  constructor(
    private config: ElementModelConf,
  ) { }
  async resolveTemplate(...ids: string[]): Promise<string | undefined> {
    ids = nonEmpties(ids);
    for (let id of ids) {
      const externals =
        nonEmpties(await Promise.all(ids.map(id => this.resolveExternalTemplate(id))));
      if (externals.length > 0 && !!externals[0]) {
        return externals[0];
      }
      if (this.config.templates[id]) {
        return this.config.templates[id];
      }
    }
    return Promise.resolve("");
  }
  async resolveExternalTemplate(qualifier: string): Promise<string | undefined> {
    const query = nonEmpties([
      `[${this.config.templateSelectorAttr}="${qualifier}"]`,
      getOrElse(() => Number.parseInt(qualifier)) ? void 0 : `#${qualifier}`
    ]).join(",");
    const topDocument = (await Dom.TopLevelWindow).document;
    const templateEl: Element = <Element>getOrElse(() => Dom.recursiveQuerySelector(topDocument, query));
    if (templateEl) {
      return templateEl.innerHTML;
    }
    return "";
  }
}
