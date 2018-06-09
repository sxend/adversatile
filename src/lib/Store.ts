import Configuration, { StoreConf } from "./Configuration";
import { EventEmitter } from "events";
import { Dispatcher, IDispatcher } from "./Dispatcher";
import { IElementData } from "../../generated-src/protobuf/messages";

export class Store extends EventEmitter {
  private state: any = {};
  constructor(
    private config: StoreConf,
    private dispatcher: IDispatcher
  ) {
    super();
    this.dispatcher.onDispatch("ElementData", (data: IElementData) => {
      this.onElementData(data);
    });
  }
  private onElementData(elementData: IElementData) {
    (this.state[elementData.name] = this.state[elementData.name] || []).push(elementData);
    this.emit(`change:${elementData.name}`);
  }
  hasElementData(name: string): boolean {
    return !!this.state[name] && this.state[name].length > 0;
  }
  consumeElementData(name: string): IElementData {
    return (this.state[name] || []).shift();
  }
}
