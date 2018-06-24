export class RouletteWheel<A> {
  private elements: A[] = [];
  constructor(private weight: (element: A) => number) { }
  add(element: A): void {
    this.elements.push(element);
  }
  private createWheel(): { sum: number, pockets: { threshold: number, element: A }[] } {
    let sum = 0;
    const pockets = this.elements.map(element => {
      const weight = this.weight(element);
      return {
        threshold: sum += weight,
        element
      };
    });
    return { sum, pockets };
  }
  select(): A | undefined {
    const wheel = this.createWheel();
    const point = Math.random() * wheel.sum;
    for (let pocket of wheel.pockets) {
      if (point < pocket.threshold) {
        return pocket.element;
      }
    }
    return void 0;
  }
}