import { ActionConf } from "./Configuration";
import { IDispatcher } from "./Dispatcher";
import { OpenRTB } from "./openrtb/OpenRTB";
import { Tracking } from "./misc/Tracking";
import { Backend } from "./action/Backend";

export class Action {
  private backend: Backend
  constructor(
    private config: ActionConf,
    private dispatcher: IDispatcher
  ) {
    this.backend = new Backend(this.config.backend);
  }
  adcall(request: OpenRTB.BidRequest): void {
    this.dispatcher.dispatch({ event: "BidRequest:New", data: request })
    const responseP = this.backend.adcall(request);
    responseP
      .then(response => {
        this.dispatcher.dispatch({ event: "BidResponse:New", data: response });
        return Promise.resolve();
      })
      .catch(console.error);
  }
  consumeBidReqRes(req: OpenRTB.BidRequest, res: OpenRTB.BidResponse) {
    this.dispatcher.dispatch({ event: "BidRequest:Consume", data: req });
    this.dispatcher.dispatch({ event: "BidResponse:Consume", data: res });
  }
  tracking(urls: string[], trackingName: string, historied: boolean = false) {
    Tracking.trackingCall(urls, trackingName).then(_ => {
      if (historied) {
        this.dispatcher.dispatch({ event: "Tracked", data: { name: trackingName, urls } });
      }
    });
  }
}

