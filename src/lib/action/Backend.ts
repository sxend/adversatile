import { OpenRTB } from "../openrtb/OpenRTB";
import { BackendConf } from "../Configuration";
import { Jsonp } from "../misc/Jsonp";
import { RandomId } from "../misc/RandomId";
import { groupBy } from "../misc/ObjectUtils";

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
    res.ext = new OpenRTB.Ext.BidResponseExt(req.ext.group);

    const group: any = groupBy(result.bid, bid => bid.ext.tagid);
    Object.keys(group).forEach(tagId => {
      const imp = req.imp.find(imp => imp.tagid === tagId);
      if (!imp) return;
      group[tagId].forEach((bid: OpenRTB.Bid) => {
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