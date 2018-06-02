import Configuration from "./Configuration";
import { EventEmitter } from "./EventEmitter";

export class State extends EventEmitter {
  private dataMap: { [id: string]: any };
  constructor(private configuration: Configuration, private dispatcher: EventEmitter) {
    super();
    const self = this;
    self.dispatcher.on("data", (newdata: any[]) => {
      const newDataIds: string[] = [];
      newdata.forEach(data => {
        if (!data.id || !!self.dataMap[data.id]) return;
        self.dataMap[data.id] = data;
        newDataIds.push(data.id);
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