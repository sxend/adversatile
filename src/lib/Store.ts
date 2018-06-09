import Configuration, { StoreConf } from "./Configuration";
import { EventEmitter } from "events";
import { Dispatcher, IDispatcher } from "./Dispatcher";
import { IElementData, ElementData } from "../../generated-src/protobuf/messages";

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
    (this.state[data.id] = this.state[data.id] || []).push(data);
    this.emit(`change:${data.id}`);
  }
  hasElementData(id: string): boolean {
    return !!this.state[id] && this.state[id].length > 0;
  }
  consumeElementData(id: string): IElementData {
    return (this.state[id] || []).shift();
  }
}
