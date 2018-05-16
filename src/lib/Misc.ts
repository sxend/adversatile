export function isArray(o: any): boolean {
  return "[object Array]" === Object.prototype.toString.call(Object(o));
}