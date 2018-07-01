import { StoreConf } from "./Configuration";
import { EventEmitter } from "events";
import { IDispatcher } from "./Dispatcher";
import { OpenRTB } from "./openrtb/OpenRTB";
import { values, every } from "./misc/ObjectUtils";

export class Store extends EventEmitter {
  private internal: {
    requests: { [id: string]: OpenRTB.BidRequest }
    responses: { [id: string]: OpenRTB.BidResponse },
    trackedUrls: { [name: string]: string[] }
  } = <any>{};
  constructor(private config: StoreConf, private dispatcher: IDispatcher) {
    super();
    (this.internal.requests = this.internal.requests || {});
    (this.internal.responses = this.internal.responses || {});
    this.dispatcher.onDispatch("BidRequest:New", (request: OpenRTB.BidRequest) => {
      this.addBidRequest(request);
    });
    this.dispatcher.onDispatch("BidResponse:New", (response: OpenRTB.BidResponse) => {
      this.addBidResponse(response);
    });
    this.dispatcher.onDispatch("BidReqRes:Consume", (id: string) => {
      delete this.internal.requests[id];
      delete this.internal.responses[id];
    });
    this.dispatcher.onDispatch("Tracked", (data: { name: string, urls: string[] }) => {
      this.internal.trackedUrls = this.internal.trackedUrls || {};
      this.internal.trackedUrls[data.name] = (this.internal.trackedUrls[data.name] || []).concat(data.urls);
    });
  }
  private addBidRequest(request: OpenRTB.BidRequest) {
    if (this.internal.requests[request.id]) return;
    this.internal.requests[request.id] = request;
    if (this.config.bidRequestExpireMilli !== -1) {
      setTimeout(() => {
        delete this.internal.requests[request.id];
      }, this.config.bidRequestExpireMilli);
    }
    this.emit("AddBidRequest", request);
  }
  private addBidResponse(response: OpenRTB.BidResponse) {
    if (this.internal.responses[response.id]) return;
    this.internal.responses[response.id] = response;
    if (this.config.bidResponseExpireMilli !== -1) {
      setTimeout(() => {
        delete this.internal.responses[response.id];
      }, this.config.bidResponseExpireMilli);
    }
    this.emit("AddBidResponse", response);
  }
  hasBidRequest(id: string): boolean {
    return !!this.internal.requests && !!this.internal.requests[id];
  }
  getBidRequest(id: string): OpenRTB.BidRequest {
    return this.internal.requests[id];
  }
  hasBidResponse(id: string): boolean {
    return !!this.internal.responses && !!this.internal.responses[id];
  }
  getBidResponse(id: string): OpenRTB.BidResponse {
    return this.internal.responses[id];
  }
  findBidResponseByName(name: string): OpenRTB.BidResponse {
    return values(this.internal.responses).find((res: OpenRTB.BidResponse) => {
      return every(res.seatbid, (sbid) => every(sbid.bid, (bid) => bid.ext.tagid === name));
    });
  }
  getTrackedUrls(name: string): string[] {
    if (this.internal.trackedUrls) {
      return this.internal.trackedUrls[name] || [];
    }
    return [];
  }
}