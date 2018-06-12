import { OpenRTB } from "../../../src/lib/openrtb/OpenRTB";
import { OpenRTBUtils } from "../../../src/lib/openrtb/OpenRTBUtils";
import { MacroContext } from "../../../src/lib/MacroOps";
import { ElementModel } from "../../../src/lib/ElementModel";

export function dummyBid(): OpenRTB.Bid {
  return OpenRTBUtils.dummyBid();
}
export function dummyMacroContext(): MacroContext {
  return new MacroContext(
    mockElementModel(),
    {
      trackingCall: (urls: string[], trackingName: string) => {
        return Promise.resolve()
      }
    },
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