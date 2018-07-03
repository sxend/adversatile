const ProtoToString = Object.prototype.toString;

export function isObject(o: any): boolean {
  return matchToString("[object Object]", o);
}
export function isString(o: any): boolean {
  return matchToString("[object String]", o);
}
export function isArray(o: any): boolean {
  return matchToString("[object Array]", o);
}
export function isDefined(o: any): boolean {
  return !isUndefined(o) && !isNull(o);
}
export function isNull(o: any): boolean {
  return o === null;
}
export function isUndefined(o: any): boolean {
  return o === void 0;
}
export function isEmptyArray<A>(arr: A[]): boolean {
  return arr.length === 0;
}
function matchToString(expect: string, o: any): boolean {
  return expect === ProtoToString.call(Object(o));
}
