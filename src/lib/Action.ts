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
  fetchElementsData(reqs: { name: string, assets: number[] }[]): void {
    const results: Promise<IElementData>[] = reqs.map(async req => {
      const data: any =
        Math.random() > 0.5
          ? await this.fetchDataWithJson(req.assets)
          : await this.fetchDataWithJsonp(req.assets);
      return new ElementData({
        name: req.name,
        ...data.payload
      });
    });
    Promise.all(results).then(_ => _.forEach(data => {
      this.dispatcher.dispatch({ event: "ElementData", data: data })
    })).catch(console.error);
  }

  private async fetchDataWithJson(assets: number[]): Promise<IElementData> {
    return await (await fetch("/demo/sample.json")).json();
  }
  private async fetchDataWithJsonp(assets: number[]): Promise<IElementData> {
    const cb = `__adv_cb_${RandomId.gen()}`;
    return await Jsonp.fetch(`/demo/sample.jsonp?cb=${cb}`, cb);
  }
}
