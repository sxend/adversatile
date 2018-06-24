import { lockableFunction } from "../../../src/lib/misc/ObjectUtils";
import { RendererProps } from "../../../src/lib/vm/Renderer";

export function dummyProps(): RendererProps {
  return {
    impress: () => { },
    vimp: lockableFunction(() => { }),
    viewThrough: () => { },
    expired: () => { },
    disabledAreaViewabled: () => { },
    root: {
      render: () => { },
      rendered: () => { },
    }
  };
}