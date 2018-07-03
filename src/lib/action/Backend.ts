import { OpenRTB } from "../openrtb/OpenRTB";
import { BackendConf } from "../Configuration";
import { Jsonp } from "../misc/Jsonp";
import { RandomId } from "../misc/RandomId";

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