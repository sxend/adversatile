import { EventEmitter } from "events";
import { ElementData } from "../../generated-src/protobuf/messages";

export interface IDispatcher {
  dispatch(action: { event: "FetchData", data: ElementData }): void;
  onDispatch(event: "FetchData", callback: (data: ElementData) => void): void;
}
export class Dispatcher extends EventEmitter implements IDispatcher {
  dispatch(action: { event: string, data: any }): void {
    this.emit(`dispatch:${action.event}`, action.data);
  }
  onDispatch(event: string, callback: (data: any) => void): void {
    this.on(`dispatch:${event}`, (data) => callback(data));
  }
}
