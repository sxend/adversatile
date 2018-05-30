export default class Configuration {
  version: number;
}
export function isConfiguration(obj: any): boolean {
  return !!obj && obj.version !== void 0;
}
export function asConfituration(obj: any): Configuration {
  return <Configuration>obj; // TODO
}