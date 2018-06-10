import Configuration, { StoreConf } from "./Configuration";
import { EventEmitter } from "events";
import { Dispatcher, IDispatcher } from "./Dispatcher";
import { OpenRTB } from "./openrtb/OpenRTB";

export class Store extends EventEmitter {
  private state: any = {};
  constructor(private config: StoreConf, private dispatcher: IDispatcher) {
    super();
    this.dispatcher.onDispatch("FetchData", (response: OpenRTB.BidResponse) => {
      this.addBidResponse(response);
      response.seatbid.forEach(sbid => sbid.bid.forEach(bid => this.addBid(bid)));
    });
  }
  private addBidResponse(response: OpenRTB.BidResponse) {
    (this.state[response.id] = this.state[response.id] || []).push(response);
    this.emit(`change:${response.id}`, response);
  }
  private addBid(bid: OpenRTB.Bid) {
    (this.state[bid.impid] = this.state[bid.impid] || []).push(bid);
    this.emit(`change:${bid.impid}`, bid);
  }
  hasBidResponse(id: string): boolean {
    return !!this.state[id] && this.state[id].length > 0;
  }
  consumeBidResponse(id: string): OpenRTB.Bid {
    return (this.state[id] || []).shift();
  }
  hasBid(id: string): boolean {
    return !!this.state[id] && this.state[id].length > 0;
  }
  consumeBid(id: string): OpenRTB.Bid {
    return (this.state[id] || []).shift();
  }
}
