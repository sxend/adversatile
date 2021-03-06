import { EventEmitter } from "events";
import { OpenRTB } from "./openrtb/OpenRTB";

export interface IDispatcher {
  dispatch(action: { event: "BidRequest:New"; data: OpenRTB.BidRequest }): void;
  dispatch(action: { event: "BidResponse:New"; data: OpenRTB.BidResponse }): void;
  dispatch(action: { event: "BidRequest:Consume"; data: string }): void;
  dispatch(action: { event: "BidResponse:Consume"; data: string }): void;
  dispatch(action: { event: "Tracked"; data: { name: string, urls: string[] } }): void;
  onDispatch(event: "BidRequest:New", callback: (data: OpenRTB.BidRequest) => void): void;
  onDispatch(event: "BidResponse:New", callback: (data: OpenRTB.BidResponse) => void): void;
  onDispatch(event: "BidRequest:Consume", callback: (data: string) => void): void;
  onDispatch(event: "BidResponse:Consume", callback: (data: string) => void): void;
  onDispatch(event: "Tracked", callback: (data: { name: string, urls: string[] }) => void): void;
}
export class Dispatcher extends EventEmitter implements IDispatcher {
  dispatch(action: { event: string; data: any }): void {
    this.emit(`dispatch:${action.event}`, action.data);
  }
  onDispatch(event: string, callback: (data: any) => void): void {
    this.on(`dispatch:${event}`, data => callback(data));
  }
}
