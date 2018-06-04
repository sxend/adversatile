export function firstDefined<A>(arr: A[]): A | undefined {
  return (arr || []).filter(_ => _ !== void 0)[0];
}