import { MacroProps } from "../../../src/lib/vm/renderer/Macro";
import { lockableFunction } from "../../../src/lib/misc/ObjectUtils";

export function dummyProps(): MacroProps {
  return {
    impress: () => { },
    vimp: lockableFunction(() => { }),
    viewThrough: () => { },
    findAssets: () => { }
  };
}