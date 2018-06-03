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
}
export class ElementModelConf {
  idAttributeName: string = "data-adv-em-id";
  groupAttributeName: string = "data-adv-em-group";
  templateQualifierKey: string = "data-adv-em-template";
  templates: { [name: string]: string } = {};
}
export class ActionConf { }
export class StoreConf { }
export class PollingConf {
  interval: number = 100;
}
export class ExtConf { }
export function isConfiguration(obj: any): boolean {
  return !!obj && obj.version !== void 0;
}

export function asConfituration(obj: any): Configuration {
  return deepmerge(new Configuration(), obj);
}
