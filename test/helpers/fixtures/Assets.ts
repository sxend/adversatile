import { OpenRTB } from "../../../src/lib/openrtb/OpenRTB";
import { OpenRTBUtils } from "../../../src/lib/openrtb/OpenRTBUtils";
import { ElementModel } from "../../../src/lib/vm/ElementModel";
import { dummyEvents } from "./Renderer";
import { RendererContext, RendererElement } from "../../../src/lib/vm/Renderer";
import { ElementOption } from "../../../src/lib/Configuration";
import * as deepmerge from "deepmerge";

export function dummyBid(): OpenRTB.Bid {
  return OpenRTBUtils.dummyBid();
}
export function dummyRendererContext(element: HTMLElement): RendererContext {
  const bid = dummyBid();
  const sbid = new OpenRTB.SeatBid();
  sbid.bid = [bid];
  return new RendererContext(
    new RendererElement(
      mockElementModel(),
      element,
      (<any>deepmerge)(new ElementOption("mock"), {
        expandedClickParams: [{ "expand_key": "expand_value" }]
      })
    ),
    dummyEvents(),
    "",
    bid,
    0,
    sbid
  );
}
export function mockElementModel(): ElementModel {
  return <any>{
  };
}