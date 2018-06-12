import { VideoMacro } from "../../../src/lib/macro/VideoMacro";
import { MacroConf } from "../../../src/lib/Configuration";
import { dummyMacroContext } from "../../helpers/fixtures/Assets";

describe("VideoMacro", () => {
  describe("applyMacro", () => {
    it("when asset enough", async () => {
      const config = new MacroConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.video.selectorAttrName, "");
      element.appendChild(target);
      // await new VideoMacro(config, {}).applyMacro(element, dummyMacroContext());
      // expect(element.outerHTML).toBe("..."); // FIXME
    });
  });
  it("getName", () => {
    expect(new VideoMacro(new MacroConf(), {}).getName()).toBe("VideoMacro");
  });
});