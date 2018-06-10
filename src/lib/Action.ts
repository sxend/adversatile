import Configuration, { ActionConf } from "./Configuration";
import { EventEmitter } from "events";
import { Jsonp } from "./misc/Jsonp";
import { RandomId } from "./misc/RandomId";
import { Dispatcher, IDispatcher } from "./Dispatcher";
import { ElementData } from "../../generated-src/protobuf/messages";
import { OpenRTB } from "./openrtb/OpenRTB";

export class Action {
  constructor(
    private config: ActionConf,
    private dispatcher: IDispatcher
  ) { }
  fetchData(req: OpenRTB.BidRequest): void {
    const result = this.fetchDataWithJsonp(req);
    result.then(res => {
      req.imp.forEach(imp => {
        const data = new ElementData({
          id: imp.id,
          ...(<any>res)
        });
        this.dispatcher.dispatch({ event: "FetchData", data: data });
      });
      return Promise.resolve();
    }).catch(console.error);
  }
  private async fetchDataWithJson(req: OpenRTB.BidRequest): Promise<OpenRTB.BidResponse> {
    const result = await (await fetch(this.config.apiUrl + this.config.jsonFetchPath + `?${reqToParams(req)}`)).json();
    const res = new OpenRTB.BidResponse();
    res.seatbid = result.payload;
    return res;
  }
  private async fetchDataWithJsonp(req: OpenRTB.BidRequest): Promise<OpenRTB.BidResponse> {
    const cb = `__adv_cb_${RandomId.gen()}`;
    const result = await Jsonp.fetch(this.config.apiUrl + `${this.config.jsonpFetchPath}?${reqToParams(req)}&callback=${cb}`, cb);
    const res = new OpenRTB.BidResponse();
    res.seatbid = result.payload;
    return res;
  }
}

function reqToParams(req: OpenRTB.BidRequest): string {
  return Object.keys(req).map(key => {
    if (key === "imp") {
      return `imps=${encodeURIComponent(JSON.stringify((<any>req)[key]))}`;
    }
    return `${key}=${encodeURIComponent(JSON.stringify((<any>req)[key]))}`;
  }).join("&");
}