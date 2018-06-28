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
    const cb = `${this.config.adcallCallbackPrefix}${RandomId.gen()}`;
    const result = await Jsonp.fetch<OpenRTB.SeatBid>(
      this.config.apiUrl +
      `${this.config.adcallPath}?${reqToParams(req)}&callback=${cb}`,
      cb
    );
    const res = new OpenRTB.BidResponse();
    res.id = req.id;
    res.seatbid = [result];
    res.ext = new OpenRTB.Ext.BidResponseExt(req.ext.group);

    const group = groupBy(result.bid, bid => bid.ext.tagid);
    Object.keys(group).forEach(tagId => {
      const imps = req.imp.filter(imp => imp.tagid === tagId);
      const defaultImp = imps[0];
      if (!defaultImp) return;
      group[tagId].forEach((bid: OpenRTB.Bid) => {
        const imp = imps.shift() || defaultImp;
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