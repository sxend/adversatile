import { MacroProps } from "../../../src/lib/vm/renderer/Macro";

export function dummyProps(): MacroProps {
  return {
    impress: () => { },
    vimp: () => { },
    viewThrough: () => { },
    findAssets: () => { }
  };
}