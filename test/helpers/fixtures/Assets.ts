import { OpenRTB } from "../../../src/lib/openrtb/OpenRTB";
import { OpenRTBUtils } from "../../../src/lib/openrtb/OpenRTBUtils";
import { ElementModel } from "../../../src/lib/vm/ElementModel";
import { dummyProps } from "./Renderer";
import { RendererContext } from "../../../src/lib/vm/Renderer";
import { ElementOption } from "../../../src/lib/Configuration";
import * as deepmerge from "deepmerge";

export function dummyBid(): OpenRTB.Bid {
  return OpenRTBUtils.dummyBid();
}
export function dummyRendererContext(element: HTMLElement): RendererContext {
  return new RendererContext(
    mockElementModel(),
    element,
    dummyProps(),
    [dummyBid()]
  );
}
export function mockElementModel(): ElementModel {
  return <any>{
    option: (<any> deepmerge)(new ElementOption("mock"), {
      expandedClickParams: [{ "expand_key": "expand_value" }]
    })
  };
}