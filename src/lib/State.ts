import Configuration from "./Configuration";
import { EventEmitter } from "events";

export class State extends EventEmitter {
  private dataMap: { [id: string]: any } = {};
  constructor(private configuration: Configuration, private dispatcher: EventEmitter) {
    super();
    const self = this;
    self.dispatcher.on("data", (newdata: any[]) => {
      const newDataIds: string[] = [];
      newdata.forEach(envelope => {
        if (!envelope.id || !!self.dataMap[envelope.id]) {
          return;
        }
        self.dataMap[envelope.id] = envelope.data;
        newDataIds.push(envelope.id);
      });
      if (newDataIds.length > 0) {
        self.emit("new_data", newDataIds);
      }
    });
  }
  getData(id: string): any {
    return this.dataMap[id];
  }
}