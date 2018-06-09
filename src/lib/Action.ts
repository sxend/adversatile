import Configuration, { ActionConf } from "./Configuration";
import { EventEmitter } from "events";
import { Jsonp } from "./misc/Jsonp";
import { RandomId } from "./misc/RandomId";
import { Dispatcher, IDispatcher } from "./Dispatcher";
import { ElementData, IElementData, BidRequest, BidResponse } from "../../generated-src/protobuf/messages";

export class Action {
  constructor(
    private config: ActionConf,
    private dispatcher: IDispatcher
  ) { }
  fetchData(req: BidRequest): void {
    const result = Math.random() > 0.5
      ? this.fetchDataWithJson(req)
      : this.fetchDataWithJsonp(req);
    result.then(res => {
      req.imp.forEach(imp => {
        const data = new ElementData({
          name: imp.id,
          ...(<any>res)
        });
        this.dispatcher.dispatch({ event: "FetchData", data: data });
      });
      return Promise.resolve();
    }).catch(console.error);
  }
  private async fetchDataWithJson(req: BidRequest): Promise<BidResponse> {
    const result = await (await fetch(this.config.apiUrl + this.config.jsonFetchPath + `?${reqToParams(req)}`)).json();
    return new BidResponse({
      id: req.id,
      ...result.payload
    });
  }
  private async fetchDataWithJsonp(req: BidRequest): Promise<BidResponse> {
    const cb = `__adv_cb_${RandomId.gen()}`;
    const result = await Jsonp.fetch(this.config.apiUrl + `${this.config.jsonPFetchPath}?${reqToParams(req)}&callback=${cb}`, cb);
    return new BidResponse({
      id: req.id,
      ...result.payload
    });
  }
}

function reqToParams(req: BidRequest): string {
  return Object.keys(req).map(key => {
    return `${key}=${encodeURIComponent(JSON.stringify((<any>req)[key]))}`
  }).join("&");
}