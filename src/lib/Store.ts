import Configuration, { StoreConf } from "./Configuration";
import { EventEmitter } from "events";
import { Dispatcher, IDispatcher } from "./Dispatcher";
import { IElementData, BidResponse, ElementData } from "../../generated-src/protobuf/messages";

export class Store extends EventEmitter {
  private state: any = {};
  constructor(
    private config: StoreConf,
    private dispatcher: IDispatcher
  ) {
    super();
    this.dispatcher.onDispatch("FetchData", (data: ElementData) => {
      this.onElementData(data);
    });
  }
  private onElementData(data: ElementData) {
    (this.state[data.name] = this.state[data.name] || []).push(data);
    this.emit(`change:${data.name}`);
  }
  hasElementData(name: string): boolean {
    return !!this.state[name] && this.state[name].length > 0;
  }
  consumeElementData(name: string): IElementData {
    return (this.state[name] || []).shift();
  }
}
