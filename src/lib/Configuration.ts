export default class Configuration {
  version: number = 1;
  selector: string;
  markedClass: string = "adversatile-marked";
  polling: Polling = new Polling();
}
export class Polling {
  interval: number = 100;
}

export function isConfiguration(obj: any): boolean {
  return !!obj && obj.version !== void 0;
}

export function asConfituration(obj: any): Configuration {
  return Object.assign(new Configuration(), obj);
}
