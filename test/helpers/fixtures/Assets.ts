import { OpenRTB } from "../../../src/lib/openrtb/OpenRTB";
import { OpenRTBUtils } from "../../../src/lib/openrtb/OpenRTBUtils";
import { MacroContext } from "../../../src/lib/MacroOps";
import { ElementModel } from "../../../src/lib/ElementModel";
import { dummyProps } from "./Macro";

export function dummyBid(): OpenRTB.Bid {
  return OpenRTBUtils.dummyBid();
}
export function dummyMacroContext(element: HTMLElement, template): MacroContext {
  return new MacroContext(
    mockElementModel(),
    element,
    dummyProps(),
    template,
    dummyBid()
  );
}
export function mockElementModel(): ElementModel {
  return <any> {
    option: {
      expandedClickParams: [{"expand_key": "expand_value"}]
    }
  };
}