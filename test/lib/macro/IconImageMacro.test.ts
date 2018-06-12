import { IconImageMacro } from "../../../src/lib/macro/IconImageMacro";
import { MacroConf } from "../../../src/lib/Configuration";
import { dummyMacroContext } from "../../helpers/fixtures/Assets";
import { OpenRTBUtils } from "../../../src/lib/openrtb/OpenRTBUtils";

describe("IconImageMacro", () => {
  describe("applyMacro", () => {
    it("when asset enough", async () => {
      const config = new MacroConf();
      const element = document.createElement("div");
      const target = document.createElement("img");
      target.setAttribute(config.iconImage.selectorAttrName, "");
      element.appendChild(target);
      await new IconImageMacro(config, {}).applyMacro(element, dummyMacroContext());
      expect(target.src).toBe(OpenRTBUtils.dummyImg);
    });
  });
  it("getName", () => {
    expect(new IconImageMacro(new MacroConf(), {}).getName()).toBe("IconImageMacro");
  });
});