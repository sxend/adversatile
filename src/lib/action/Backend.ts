import { OpenRTB } from "../openrtb/OpenRTB";
import { BackendConf } from "../Configuration";
import { Jsonp } from "../misc/Jsonp";
import { RandomId } from "../misc/RandomId";

export class Backend {
  constructor(private config: BackendConf) {
    this.config.plugins.forEach(plugin => plugin.install(this));
  }
  async adcall(req: OpenRTB.BidRequest): Promise<OpenRTB.BidResponse> {
    const cb = `${this.config.fetchCallbackPrefix}${RandomId.gen()}`;
    const result = <OpenRTB.SeatBid>await Jsonp.fetch(
      this.config.apiUrl +
      `${this.config.jsonpFetchPath}?${reqToParams(req)}&callback=${cb}`,
      cb
    );
    const res = new OpenRTB.BidResponse();
    res.id = req.id;
    res.seatbid = [result];
    res.ext = res.ext || new OpenRTB.Ext.BidResponseExt();
    res.ext.group = req.ext.group;
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