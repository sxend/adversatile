import { MarkupVideoMacro } from "../../../src/lib/macro/MarkupVideoMacro";
import { MacroConf } from "../../../src/lib/Configuration";

describe("MarkupVideoMacro", () => {
  describe("applyMacro", () => {
    it("when asset enough", async () => {
      const config = new MacroConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.markupVideo.selectorAttrName, "");
      element.appendChild(target);
      // await new MarkupVideoMacro(config, {}).applyMacro(element, dummyMacroContext());
      // expect(element.outerHTML).toBe("..."); // FIXME
    });
  });
  it("getName", () => {
    expect(new MarkupVideoMacro(new MacroConf()).getName()).toBe("MarkupVideoMacro");
  });
});