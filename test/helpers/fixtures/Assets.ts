import { OpenRTB } from "../../../src/lib/openrtb/OpenRTB";
import { OpenRTBUtils } from "../../../src/lib/openrtb/OpenRTBUtils";
import { ElementModel } from "../../../src/lib/vm/ElementModel";
import { dummyProps } from "./Renderer";
import { RendererContext } from "../../../src/lib/vm/Renderer";

export function dummyBid(): OpenRTB.Bid {
  return OpenRTBUtils.dummyBid();
}
export function dummyRendererContext(element: HTMLElement): RendererContext {
  return new RendererContext(
    mockElementModel(),
    element,
    dummyProps(),
    dummyBid()
  );
}
export function mockElementModel(): ElementModel {
  return <any>{
    option: {
      expandedClickParams: [{ "expand_key": "expand_value" }]
    }
  };
}