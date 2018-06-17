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
export function getOrElse<A>(fn: () => A, el?: A): A {
  try {
    return fn();
  } catch (e) { }
  return el;
}
export function onceFunction(fn: Function): () => void {
  let first = true;
  return (...args: any[]) => {
    if (first) {
      first = false;
      fn.apply(null, args);
    }
  };
}

export interface LockableFunction extends Function {
  lock(): Function
}
export function lockableFunction(fn: Function): LockableFunction {
  let lock = false;
  const lockable = (...args: any[]) => {
    if (lock) return;
    fn.apply(null, args);
  };
  (<any>lockable).lock = () => {
    lock = true;
    return fn;
  };
  return <any>lockable;
}