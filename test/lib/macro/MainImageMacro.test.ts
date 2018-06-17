import { MainImageMacro } from "../../../src/lib/vm/renderer/macro/MainImageMacro";
import { MacroConf } from "../../../src/lib/Configuration";
import { dummyMacroContext } from "../../helpers/fixtures/Assets";
import { OpenRTBUtils } from "../../../src/lib/openrtb/OpenRTBUtils";

describe("MainImageMacro", () => {
  describe("applyMacro", () => {
    it("when asset enough", async () => {
      const config = new MacroConf();
      const element = document.createElement("div");
      const target = document.createElement("img");
      target.setAttribute(config.mainImage.selectorAttrName, "");
      element.appendChild(target);
      const context = dummyMacroContext(element, "");
      await new MainImageMacro(config, context.props).applyMacro(context);
      expect(target.src).toBe(OpenRTBUtils.dummyImg);
    });
  });
  it("getName", () => {
    const element = document.createElement("div");
    const context = dummyMacroContext(element, "");
    expect(new MainImageMacro(new MacroConf(), context.props).getName()).toBe("MainImageMacro");
  });
});