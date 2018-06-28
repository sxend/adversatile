import { lockableFunction } from "../../../src/lib/misc/ObjectUtils";
import { RendererEvents } from "../../../src/lib/vm/Renderer";

export function dummyProps(): RendererEvents {
  return {
    impress: () => { },
    vimp: lockableFunction(() => { }),
    viewThrough: () => { },
    expired: () => { },
    click: () => { },
    root: {
      render: () => { },
      rendered: () => { },
    }
  };
}