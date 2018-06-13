
declare module "deepmerge" {
  interface Options {
    clone?: boolean;
    arrayMerge?(destination: any[], source: any[], options?: Options): any[];
    isMergeableObject?(value: object): boolean;
  }
  export default function deepmerge<T1, T2>(x: T1, y: T2, options?: Options): T1 & T2;
}
declare module "deepmerge/dist/es" {
  interface Options {
    clone?: boolean;
    arrayMerge?(destination: any[], source: any[], options?: Options): any[];
    isMergeableObject?(value: object): boolean;
  }
  export default function deepmerge<T1, T2>(x: T1, y: T2, options?: Options): T1 & T2;
}