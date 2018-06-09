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
  deviceIfaAttrName: string = "data-adv-device-ifa";
  polling: PollingConf = new PollingConf();
  em: ElementModelConf = new ElementModelConf();
  prefetch: PrefetchConf[] = [];
}
export class ElementModelConf {
  nameAttributeName: string = "data-adv-em-name";
  templateQualifierKey: string = "data-adv-em-template";
  options: { [name: string]: ElementOption } = {};
  hasOption: (name: string) => boolean = function (name) {
    return Object.keys(this.options).indexOf(name) !== -1;
  };
  option: (name: string) => ElementOption = function (name) {
    return deepmerge(new ElementOption(name), this.options[name] || {});
  };
  templates: { [name: string]: string } = {};
  macro: MacroConf = new MacroConf();
}
export class ElementOption {
  constructor(public name: string) { }
  preRender: boolean = true;
  format: string = "native";
  assets: number[] = []; // FIXME use official asset
}
export class ActionConf {
  apiUrl: string = "/* @echo API_URL */";
  jsonFetchPath: string = "/* @echo JSON_FETCH_PATH */" || "/demo/sample.json";
  jsonPFetchPath: string = "/* @echo JSONP_FETCH_PATH */" || "/demo/sample.jsonp";
}
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
  return configuration;
}
