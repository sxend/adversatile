import { firstDefined, getOrElse } from "../../misc/ObjectUtils";

export class TemplateOps {
  constructor(
    private templates: { [id: string]: string },
    private templateQualifierKey: string
  ) { }
  async resolveTemplate(...ids: string[]): Promise<string | undefined> {
    const template = firstDefined(
      [].concat(
        ids.map(id => this.resolveExternalTemplate(id)),
        ids.map(id => this.templates[id])
      )
    );
    return template;
  }
  resolveExternalTemplate(qualifier: string): string | undefined {
    const query = `[${this.templateQualifierKey}="${qualifier}"]`;
    const templateEl = getOrElse(() => document.querySelector(query));
    if (templateEl) {
      return templateEl.innerHTML;
    }
    return void 0;
  }
}
