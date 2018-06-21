
export function firstDefined<A>(arr: A[]): A | undefined {
  return (arr || []).filter(_ => _ !== void 0)[0];
}
// Object.assign polyfill https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
export function assign(target: any, _varArgs: any) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  const to = Object(target);
  for (let index = 1; index < arguments.length; index++) {
    const nextSource = arguments[index];
    if (nextSource != null) {
      for (let nextKey in nextSource) {
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
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
export function groupBy<A>(arr: A[], condition: (a: A) => string): { [key: string]: A[] } {
  const group: { [key: string]: A[] } = {};
  arr.forEach(obj => {
    const key = condition(obj);
    (group[key] = group[key] || []).push(obj);
  });
  return group;
}
export function nonEmpties<A>(arr: A[]): A[] {
  return arr.filter(obj => !!obj);
}
export function contains<A>(arr: A[], a: A): boolean {
  return arr.indexOf(a) !== -1;
}
export function containsOr<A>(arr: A[], ...conds: A[]): boolean {
  let result = false;
  arr.forEach(obj => {
    if (contains(conds, obj)) {
      result = true;
    }
  });
  return result;
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

type FunctionA<A> = (a: A) => void;

export interface LockableFunction<A> extends FunctionA<A> {
  lock(): FunctionA<A>
}
export function lockableFunction<A>(fn: FunctionA<A>): LockableFunction<A> {
  let lock = false;
  const lockable = function(this: any, ...args: any[]) {
    if (lock) return;
    fn.apply(this, args);
  };
  (<any>lockable).lock = () => {
    lock = true;
    return fn;
  };
  return <any>lockable;
}