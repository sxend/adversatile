import Configuration, { ActionConf } from "./Configuration";
import { EventEmitter } from "events";
import { Jsonp } from "./misc/Jsonp";
import { RandomId } from "./misc/RandomId";
import { Dispatcher, IDispatcher } from "./Dispatcher";
import { ElementData, IElementData } from "../../generated-src/protobuf/messages";
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
    return new OpenRTB.BidResponse(result.payload);
  }
  private async fetchDataWithJsonp(req: OpenRTB.BidRequest): Promise<OpenRTB.BidResponse> {
    const cb = `__adv_cb_${RandomId.gen()}`;
    const result = await Jsonp.fetch(this.config.apiUrl + `${this.config.jsonPFetchPath}?${reqToParams(req)}&callback=${cb}`, cb);
    return new OpenRTB.BidResponse(result.payload);
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