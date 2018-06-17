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
    const group: any = {};
    result.bid.forEach(bid => {
      (group[bid.ext.tagid] = group[bid.ext.tagid] || []).push(bid);
    });
    Object.keys(group).forEach(id => {
      const imp = req.imp.find(imp => imp.tagid === id);
      if (!imp) return;
      group[id].forEach((bid: OpenRTB.Bid) => {
        bid.impid = imp.id;
      });
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
