import { StoreConf } from "./Configuration";
import { EventEmitter } from "events";
import { IDispatcher } from "./Dispatcher";
import { OpenRTB } from "./openrtb/OpenRTB";

export class Store extends EventEmitter {
  private internal: any = {};
  private state: State = new State(this.internal);
  constructor(private config: StoreConf, private dispatcher: IDispatcher) {
    super();
    this.dispatcher.onDispatch("BidRequest", (request: OpenRTB.BidRequest) => {
      this.addBidRequest(request);
    });
    this.dispatcher.onDispatch("BidResponse", (response: OpenRTB.BidResponse) => {
      this.addBidResponse(response);
    });
    this.dispatcher.onDispatch("Tracked", (data: { name: string, urls: string[] }) => {
      this.internal.trackedUrls = this.internal.trackedUrls || {};
      this.internal.trackedUrls[data.name] = (this.internal.trackedUrls[data.name] || []).concat(data.urls);
    });
  }
  private addBidRequest(request: OpenRTB.BidRequest) {
    (this.internal.requests = this.internal.requests || {});
    this.internal.requests[request.id] = request;
    if (this.config.bidRequestExpireMilli !== -1) {
      setTimeout(() => {
        delete this.internal.requests[request.id];
      }, this.config.bidRequestExpireMilli);
    }
    this.emit("AddBidRequest", request);
  }
  private addBidResponse(response: OpenRTB.BidResponse) {
    (this.internal.responses = this.internal.responses || {});
    this.internal.responses[response.id] = response;
    if (this.config.bidResponseExpireMilli !== -1) {
      setTimeout(() => {
        delete this.internal.responses[response.id];
      }, this.config.bidResponseExpireMilli);
    }
    this.emit("AddBidResponse", response);
  }
  getState(): State {
    return this.state;
  }
}

export class State {
  constructor(private internal: any) { }
  hasBidRequest(id: string): boolean {
    return !!this.internal.requests && !!this.internal.requests[id] && this.internal.requests[id].length > 0;
  }
  getBidRequest(id: string): OpenRTB.BidRequest {
    return this.internal.requests[id];
  }
  hasBidResponse(id: string): boolean {
    return !!this.internal.responses && !!this.internal.responses[id] && this.internal.responses[id].length > 0;
  }
  getBidResponse(id: string): OpenRTB.Bid {
    return this.internal.responses[id];
  }
  getTrackedUrls(name: string): string[] {
    if (this.internal.trackedUrls) {
      return this.internal.trackedUrls[name] || [];
    }
    return [];
  }
}