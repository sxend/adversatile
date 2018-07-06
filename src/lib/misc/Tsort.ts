import { contains } from "./ObjectUtils";
import { isDefined } from "./TypeCheck";

// https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
export class Tsort<A> {
  private graph: { [key: string]: A[] } = {};
  private nodes: A[] = [];
  constructor(private key: (a: A) => string) {
  }
  private addNode(node: A): void {
    if (!contains(this.nodes, node)) {
      this.nodes.unshift(node);
    }
  }
  add(node0: A, node1?: A): void {
    this.addNode(node0);
    if (!isDefined(node1)) return;
    this.addNode(node1);
    const key0 = this.key(node0);
    this.graph[key0] = this.graph[key0] || [];
    if (!contains(this.graph[key0], node1)) {
      this.graph[key0].unshift(node1);
    }
  }
  sort(): A[] {
    const result: A[] = [];

    const visit = (node: any) => {
      if (node.__mark === "parmanent") return;
      if (node.__mark === "temporary") throw new Error("invalid DAG");
      node.__mark = "temporary";
      const chidlren = this.graph[this.key(node)] || [];
      chidlren.forEach(child => visit(child));
      node.__mark = "parmanent";
      result.unshift(node);
    }
    for (let node of this.nodes) {
      if (!(<any>node).__mark) {
        visit(node);
      }
    }
    return result.map(n => {
      delete (<any>n).__mark;
      return n;
    });
  }
}