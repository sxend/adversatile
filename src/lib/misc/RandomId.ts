export namespace RandomId {
  export function gen(prefix: string = ""): string {
    return `${prefix ? `${prefix}_` : ""}${Date.now().toString(32)}_${Math.random()
      .toString(32)
      .substring(2)}`;
  }
}
