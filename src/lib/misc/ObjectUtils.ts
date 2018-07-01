import { isDefined } from "./TypeCheck";

export function firstDefined<A>(arr: A[]): A | undefined {
  return (arr || []).filter(isDefined)[0];
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

// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#Polyfill
export function entries(obj: any) {
  const ownProps = Object.keys(obj);
  let i = ownProps.length;
  const resArray = new Array(i);
  while (i--)
    resArray[i] = [ownProps[i], obj[ownProps[i]]];
  return resArray;
}

export function values(obj: any): any[] {
  const result = [];
  for (let key in obj) {
    result.push(obj[key]);
  }
  return result;
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

export function flatten<A>(nested: A[][]): A[] {
  return nested.reduce((prev, current) => prev.concat(current), []);
}

export function every<A>(arr: A[], fn: (a: A) => boolean): boolean {
  return arr.reduce((p, c) => p && fn(c), true);
}

export function rotate<A>(arr: A[], num: number = 0): A[] {
  for (let i = 0; i < num; i++) {
    arr.push(arr.shift());
  }
  return arr;
}

export function nonEmpties<A>(arr: A[]): A[] {
  return arr.filter(nonEmpty);
}

export function nonEmpty<A>(obj: A): boolean {
  return !!obj;
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
    const result = fn();
    if (isDefined(result)) {
      return result;
    }
  } catch (e) { }
  return el;
}

export function onceFunction<A>(fn: FunctionA<A>): FunctionA<A> {
  let first = true;
  return (...args: any[]) => {
    if (first) {
      first = false;
      fn.apply(null, args);
    }
  };
}

type FunctionA<A> = (_: A) => void;

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