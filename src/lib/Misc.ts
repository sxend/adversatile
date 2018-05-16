const ProtoToString = Object.prototype.toString;

export function isObject(o: any): boolean {
  return matchToString("[object Object]", o);
}
export function isArray(o: any): boolean {
  return matchToString("[object Array]", o);
}
function matchToString(expect: string, o: any): boolean {
  return expect === ProtoToString.call(Object(o));
}