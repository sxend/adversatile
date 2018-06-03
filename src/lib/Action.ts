import Configuration from "./Configuration";
import { EventEmitter } from "events";
import { Jsonp } from "./misc/Jsonp";
import { RandomId } from "./misc/RandomId";

export class Action {
  constructor(
    private configuration: Configuration,
    private dispatcher: EventEmitter
  ) {}
  async fetchData(ids: string[]) {
    let result: Promise<any>;
    const results = ids.map(id => {
      return Math.random() > 0.5
        ? this.fetchDataWithJson(id)
        : this.fetchDataWithJsonp(id);
    });
    this.dispatcher.emit("data", await Promise.all(results));
  }
  private async fetchDataWithJson(id: string) {
    const data = await (await fetch("/demo/sample.json")).json();
    data.id = id;
    return data;
  }
  private async fetchDataWithJsonp(id: string) {
    const cb = `${id}_cb`;
    const data = await Jsonp.fetch(`/demo/sample.jsonp?cb=${cb}`, cb);
    data.id = id;
    return data;
  }
}
