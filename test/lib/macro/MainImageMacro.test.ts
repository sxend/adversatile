import { MainImageMacro } from "../../../src/lib/macro/MainImageMacro";
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
      await new MainImageMacro(config, {}).applyMacro(element, dummyMacroContext());
      expect(target.src).toBe(OpenRTBUtils.dummyImg);
    });
  });
  it("getName", () => {
    expect(new MainImageMacro(new MacroConf(), {}).getName()).toBe("MainImageMacro");
  });
});