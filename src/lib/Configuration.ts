export default class Configuration {
  version: number;
  selector: string;
}
export function isConfiguration(obj: any): boolean {
  return !!obj && obj.version !== void 0;
}
export function asConfituration(obj: any): Configuration {
  return Object.assign(new Configuration(), obj);
}
