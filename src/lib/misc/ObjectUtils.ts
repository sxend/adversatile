export function firstDefined<A>(arr: A[]): A | undefined {
  return (arr || []).filter(_ => _ !== void 0)[0];
}
export function uniq<A>(arr: A[]): A[] {
  return arr.filter((x, i, self) => self.indexOf(x) === i);
}
export function uniqBy<A>(arr: A[], condition: (a: A) => any): A[] {
  const flags: any = {};
  return arr.filter(x => {
    const key = condition(x);
    if (flags[key]) return false;
    return (flags[key] = true);
  });
}
