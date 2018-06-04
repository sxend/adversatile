import Configuration from "./Configuration";
import { EventEmitter } from "events";
import { Jsonp } from "./misc/Jsonp";
import { RandomId } from "./misc/RandomId";

export class Action {
  constructor(
    private configuration: Configuration,
    private dispatcher: EventEmitter
  ) { }
  fetchData(reqs: any[]) {
    let result: Promise<any>;
    const results = reqs.map(async req => {
      const data: any =
        Math.random() > 0.5
          ? await this.fetchDataWithJson(req.id)
          : await this.fetchDataWithJsonp(req.id);
      return { id: req.id, data };
    });
    this.dispatchPromise("data", Promise.all(results));
  }
  private dispatchPromise(name: string, promise: Promise<any>) {
    promise
      .then(data => this.dispatcher.emit(name, data))
      .catch(console.error);
  }
  private async fetchDataWithJson(id: string) {
    return await (await fetch("/demo/sample.json")).json();
  }
  private async fetchDataWithJsonp(id: string) {
    const cb = `${id}_cb`;
    return await Jsonp.fetch(`/demo/sample.jsonp?cb=${cb}`, cb);
  }
}
