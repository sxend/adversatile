import { ViewModel } from "./ViewModel";
const deepmerge = require('deepmerge').default;

export default class Configuration {
  version: number;
  vm: ViewModelConf = new ViewModelConf();
  action: ActionConf = new ActionConf();
}

export class ViewModelConf {
  selector: string = ".adversatile";
  markedClass: string = "adversatile-marked";
  polling: PollingConf = new PollingConf();
  em: ElementModelConf = new ElementModelConf();
}
export class ElementModelConf {
  idAttributeName: string = "data-adversatile-id";
}

export class ActionConf {
}

export class PollingConf {
  interval: number = 100;
}

export function isConfiguration(obj: any): boolean {
  return !!obj && obj.version !== void 0;
}

export function asConfituration(obj: any): Configuration {
  return deepmerge(new Configuration(), obj);
}
