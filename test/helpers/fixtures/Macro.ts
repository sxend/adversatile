import { MacroProps } from "../../../src/lib/em/renderer/Macro";

export function dummyProps(): MacroProps {
  return {
    impress: () => { },
    vimp: () => { },
    viewThrough: () => { },
  };
}