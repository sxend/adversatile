import { EventEmitter } from "events";

export class Dispatcher extends EventEmitter {
  dispatch(action: { event: string; data: any }) {
    this.emit("dispatch", action);
  }
  onDispatch(callback: (action: { event: string; data: any }) => void) {
    this.on("dispatch", callback);
  }
}
