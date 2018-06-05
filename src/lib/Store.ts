import Configuration from "./Configuration";
import { EventEmitter } from "events";
import { Dispatcher, IDispatcher } from "./Dispatcher";
import { IElementData } from "../../generated-src/protobuf/messages";

export class Store extends EventEmitter {
  private state: any = {};
  private dataMap: { [id: string]: any } = {};
  constructor(
    private configuration: Configuration,
    private dispatcher: IDispatcher
  ) {
    super();
    this.dispatcher.onDispatch("ElementData", (data: IElementData) => {
      this.onElementData(data);
    });
  }
  private onElementData(elementData: IElementData) {
    this.state[elementData.id] = elementData;
    this.emit(`change:${elementData.id}`, this.state[elementData.id]);
  }
  getState(): any {
    return this.state;
  }
}
