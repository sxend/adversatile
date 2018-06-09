import Configuration, { ActionConf } from "./Configuration";
import { EventEmitter } from "events";
import { Jsonp } from "./misc/Jsonp";
import { RandomId } from "./misc/RandomId";
import { Dispatcher, IDispatcher } from "./Dispatcher";
import { ElementData, IElementData } from "../../generated-src/protobuf/messages";

export class Action {
  constructor(
    private config: ActionConf,
    private dispatcher: IDispatcher
  ) { }
  fetchElementsData(reqs: any[]): void {
    const results: Promise<IElementData>[] = reqs.map(async req => {
      const data: any =
        Math.random() > 0.5
          ? await this.fetchDataWithJson(req.id)
          : await this.fetchDataWithJsonp(req.id);
      return new ElementData({
        id: req.id,
        ...data.payload
      });
    });
    Promise.all(results).then(_ => _.forEach(data => {
      this.dispatcher.dispatch({ event: "ElementData", data: data })
    })).catch(console.error);
  }

  private async fetchDataWithJson(id: string): Promise<IElementData> {
    return await (await fetch("/demo/sample.json")).json();
  }
  private async fetchDataWithJsonp(id: string): Promise<IElementData> {
    const cb = `${id}_cb`;
    return await Jsonp.fetch(`/demo/sample.jsonp?cb=${cb}`, cb);
  }
}
