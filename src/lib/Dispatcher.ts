import { EventEmitter } from "events";
import { OpenRTB } from "./openrtb/OpenRTB";

export interface IDispatcher {
  dispatch(action: { event: "FetchData"; data: OpenRTB.BidResponse }): void;
  onDispatch(event: "FetchData", callback: (data: OpenRTB.BidResponse) => void): void;
}
export class Dispatcher extends EventEmitter implements IDispatcher {
  dispatch(action: { event: string; data: any }): void {
    this.emit(`dispatch:${action.event}`, action.data);
  }
  onDispatch(event: string, callback: (data: any) => void): void {
    this.on(`dispatch:${event}`, data => callback(data));
  }
}
