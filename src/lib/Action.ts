import { ActionConf } from "./Configuration";
import { Jsonp } from "./misc/Jsonp";
import { RandomId } from "./misc/RandomId";
import { IDispatcher } from "./Dispatcher";
import { OpenRTB } from "./openrtb/OpenRTB";
import { Tracking } from "./misc/Tracking";

export class Action {
  constructor(private config: ActionConf, private dispatcher: IDispatcher) { }
  fetchData(req: OpenRTB.BidRequest): void {
    const result = this.fetchDataWithJsonp(req);
    result
      .then(data => {
        this.dispatcher.dispatch({ event: "BidResponse", data: data });
        return Promise.resolve();
      })
      .catch(console.error);
  }
  tracking(urls: string[], trackingName: string, historied: boolean = false) {
    Tracking.trackingCall(urls, trackingName).then(_ => {
      if (historied) {
        this.dispatcher.dispatch({ event: "Tracked", data: { name: trackingName, urls } });
      }
    });
  }
  private async fetchDataWithJsonp(
    req: OpenRTB.BidRequest
  ): Promise<OpenRTB.BidResponse> {
    const cb = `__adv_cb_${RandomId.gen()}`;
    const result = await Jsonp.fetch(
      this.config.apiUrl +
      `${this.config.jsonpFetchPath}?${reqToParams(req)}&callback=${cb}`,
      cb
    );
    const res = new OpenRTB.BidResponse();
    res.id = req.id;
    res.seatbid = [result];
    return res;
  }
}

function reqToParams(req: OpenRTB.BidRequest): string {
  return Object.keys(req)
    .map(key => {
      if (key === "imp") {
        return `imps=${encodeURIComponent(JSON.stringify((<any>req)[key]))}`;
      }
      return `${key}=${encodeURIComponent(JSON.stringify((<any>req)[key]))}`;
    })
    .join("&");
}
