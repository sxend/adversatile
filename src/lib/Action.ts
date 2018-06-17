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
    const cb = `${this.config.fetchCallbackPrefix}${RandomId.gen()}`;
    const result = <OpenRTB.SeatBid>await Jsonp.fetch(
      this.config.apiUrl +
      `${this.config.jsonpFetchPath}?${reqToParams(req)}&callback=${cb}`,
      cb
    );
    const res = new OpenRTB.BidResponse();
    res.id = req.id;
    res.seatbid = [result];
    const used: string[] = [];
    result.bid.forEach(bid => {
      if (bid.impid !== "1") return;
      for (let imp of req.imp) {
        if (bid.ext.tagid === imp.tagid && used.indexOf(imp.id) === -1) {
          used.push(bid.impid = imp.id);
          break;
        }
      }
    });
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
