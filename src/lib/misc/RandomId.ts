export namespace RandomId {
  export function gen(): string {
    return `${Date.now().toString(32)}_${Math.random()
      .toString(32)
      .substring(2)}`;
  }
}
