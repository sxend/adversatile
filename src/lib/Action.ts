import Configuration from "./Configuration";
import { EventEmitter } from "events";
import { Jsonp } from "./misc/Jsonp";

export class Action {
  constructor(
    private configuration: Configuration,
    private dispatcher: EventEmitter
  ) { }
  async fetchData(ids: string[]) {
    const results = await Promise.all(ids.map(async (id) => {
      const fetched = await fetch("https://httpbin.org/json");
      const result = await fetched.json();
      result.id = id;
      return result;
    }));
    this.dispatcher.emit("data", results);
  }
}
