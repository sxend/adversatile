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
    dummyBid(),
    0,
  );
}
export function mockElementModel(): ElementModel {
  return <any>{
  };
}