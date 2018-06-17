import { IconImageMacro } from "../../../src/lib/vm/renderer/macro/IconImageMacro";
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
      const context = dummyMacroContext(element, "");
      await new IconImageMacro(config, context.props).applyMacro(context);
      expect(target.src).toBe(OpenRTBUtils.dummyImg);
    });
  });
  it("getName", () => {
    const context = dummyMacroContext(document.createElement("div"), "");
    expect(new IconImageMacro(new MacroConf(), context.props).getName()).toBe("IconImageMacro");
  });
});