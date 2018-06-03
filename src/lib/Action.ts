import Configuration from "./Configuration";
import { EventEmitter } from "events";
import { Jsonp } from "./misc/Jsonp";
import { RandomId } from "./misc/RandomId";

export class Action {
  constructor(
    private configuration: Configuration,
    private dispatcher: EventEmitter
  ) { }
  async fetchData(ids: string[]) {
    let result: Promise<any>;
    const results =
      Math.random() > 0.5
        ? await this.fetchDataWithJson(ids)
        : await this.fetchDataWithJsonp(ids);
    this.dispatcher.emit("data", await Promise.all(results));
  }
  private async fetchDataWithJson(ids: string[]) {
    return ids.map(async id => {
      const data = await (await fetch("/demo/sample.json")).json();
      data.id = id;
      return data;
    });
  }
  private async fetchDataWithJsonp(ids: string[]) {
    return ids.map(async id => {
      const cb = `${id}_cb`;
      const data = await Jsonp.fetch(`/demo/sample.jsonp?cb=${cb}`, cb);
      data.id = id;
      return data;
    });
  }
}
