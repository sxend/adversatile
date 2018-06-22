import { Tsort } from "../../../src/lib/misc/Tsort";

describe.only("Tsort", () => {
  describe("sort", () => {
    it("when valid DAG", () => {
      const tsort = new Tsort<Node>(node => node.name);
      const a = new Node("a");
      const b = new Node("b");
      const c = new Node("c");
      const d = new Node("d");
      tsort.add(a, b);
      tsort.add(a, c);
      tsort.add(b, d);
      tsort.add(c, d);
      expect(tsort.sort().map(_ => _.name)).toMatchObject(["a", "b", "c", "d"]);
    });
    it("when valid DAG but duplicate add call", () => {
      const tsort = new Tsort<Node>(node => node.name);
      const a = new Node("a");
      const b = new Node("b");
      const c = new Node("c");
      const d = new Node("d");
      tsort.add(a, b);
      tsort.add(a, c);
      tsort.add(a, c);
      tsort.add(b, d);
      tsort.add(c, d);
      tsort.add(c, d);
      tsort.add(b, d);
      expect(tsort.sort().map(_ => _.name)).toMatchObject(["a", "b", "c", "d"]);
    });
  });
});

class Node {
  public mark: string;
  constructor(public name: string) { }
}