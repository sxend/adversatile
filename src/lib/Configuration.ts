import { ViewModel } from "./ViewModel";
const deepmerge = require("deepmerge").default;

export default class Configuration {
  version: number;
  vm: ViewModelConf = new ViewModelConf();
  action: ActionConf = new ActionConf();
  store: StoreConf = new StoreConf();
  ext: ExtConf = new ExtConf();
}

export class ViewModelConf {
  selector: string = ".adversatile";
  markedClass: string = "adv-marked";
  polling: PollingConf = new PollingConf();
  em: ElementModelConf = new ElementModelConf();
  prefetch: PrefetchConf[] = [];
}
export class ElementModelConf {
  nameAttributeName: string = "data-adv-em-name";
  templateQualifierKey: string = "data-adv-em-template";
  options: { [name: string]: ElementOption } = {};
  hasOption(name: string): boolean {
    return Object.keys(this.options).indexOf(name) !== -1;
  }
  option(name: string): ElementOption {
    return deepmerge(new ElementOption(), this.options[name] || {});
  }
  templates: { [name: string]: string } = {};
  macro: MacroConf = new MacroConf();
  static setPrototype(em: any) {
    Object.setPrototypeOf(em, ElementModelConf.prototype);
  }
}
export class ElementOption {
  preRender: boolean = true;
  assets: number[] = []; // FIXME use official asset
}
export class ActionConf { }
export class StoreConf { }
export class MacroConf {
  link: LinkMacroConf = new LinkMacroConf();
}
export class LinkMacroConf {
  selector: string = 'a[data-adv-macro-link]';
}
export class PollingConf {
  interval: number = 100;
}
export class PrefetchConf {
  name: string;
  size: number;
}
export class ExtConf { }
export function isConfiguration(obj: any): boolean {
  return !!obj && obj.version !== void 0;
}

export function asConfituration(obj: any): Configuration {
  const configuration = deepmerge(new Configuration(), obj || {});
  ElementModelConf.setPrototype(configuration.vm.em);
  return configuration;
}
