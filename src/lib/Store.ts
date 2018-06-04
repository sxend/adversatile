import Configuration from "./Configuration";
import { EventEmitter } from "events";
import { Dispatcher } from "./Dispatcher";

export class Store extends EventEmitter {
  private state: any = {};
  private dataMap: { [id: string]: any } = {};
  constructor(
    private configuration: Configuration,
    private dispatcher: Dispatcher
  ) {
    super();
    const self = this;
    self.dispatcher.onDispatch((action: { event: string; data: any }) => {
      this.applyAction(action);
    });
  }
  applyAction(action: { event: string; data: any }): void {
    switch (action.event) {
      case "ElementsData":
        action.data.forEach((envelope: any) => {
          if (!envelope.id) {
            return;
          }
          this.state[envelope.id] = envelope.data;
          this.emit(`change:${envelope.id}`, this.state[envelope.id]);
        });
        break;
      default:
        break;
    }
  }
  getState(): any {
    return this.state;
  }
}
