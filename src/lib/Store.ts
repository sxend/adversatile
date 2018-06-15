import { StoreConf } from "./Configuration";
import { EventEmitter } from "events";
import { IDispatcher } from "./Dispatcher";
import { OpenRTB } from "./openrtb/OpenRTB";

export class Store extends EventEmitter {
  private internal: any = {};
  private state: State = new State(this.internal);
  constructor(private config: StoreConf, private dispatcher: IDispatcher) {
    super();
    this.config.toString(); // FIXME
    this.dispatcher.onDispatch("BidResponse", (response: OpenRTB.BidResponse) => {
      this.addBidResponse(response);
      response.seatbid.forEach(sbid => sbid.bid.forEach(bid => this.addBid(bid)));
    });
    this.dispatcher.onDispatch("Tracked", (data: { name: string, urls: string[] }) => {
      this.internal.trackedUrls = this.internal.trackedUrls || {};
      this.internal.trackedUrls[data.name] = (this.internal.trackedUrls[data.name] || []).concat(data.urls);
    });
  }
  private addBidResponse(response: OpenRTB.BidResponse) {
    (this.internal.responses = this.internal.responses || {});
    (this.internal.responses[response.id] = this.internal.responses[response.id] || []).push(response);
    this.emit("AddBidResponse", response);
  }
  private addBid(bid: OpenRTB.Bid) {
    (this.internal.bids = this.internal.bids || {});
    (this.internal.bids[bid.impid] = this.internal.bids[bid.impid] || []).push(bid);
    this.emit("AddBid", bid);
  }
  getState(): State {
    return this.state;
  }
}

export class State {
  constructor(private internal: any) { }
  hasBidResponse(id: string): boolean {
    return !!this.internal.responses && !!this.internal.responses[id] && this.internal.responses[id].length > 0;
  }
  getBidResponse(id: string): OpenRTB.Bid {
    return (this.internal.responses[id] || []).shift();
  }
  hasBid(id: string): boolean {
    return !!this.internal.bids && !!this.internal.bids[id] && this.internal.bids[id].length > 0;
  }
  getBid(id: string): OpenRTB.Bid {
    return (this.internal.bids[id] || []).shift();
  }
  getTrackedUrls(name: string): string[] {
    if (this.internal.trackedUrls) {
      return this.internal.trackedUrls[name] || [];
    }
    return [];
  }
}