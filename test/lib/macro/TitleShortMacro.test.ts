import { TitleShortMacro } from "../../../src/lib/macro/TitleShortMacro";
import { MacroConf } from "../../../src/lib/Configuration";
import { dummyMacroContext } from "../../helpers/fixtures/Assets";

describe("TitleShortMacro", () => {
  describe("applyMacro", () => {
    it("when asset enough", async () => {
      const config = new MacroConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.titleShort.selectorAttrName, "");
      element.appendChild(target);
      const context = dummyMacroContext(element, "");
      await new TitleShortMacro(config, context.props).applyMacro(context);
      expect(target.textContent).toBe("...");
    });
  });
  it("getName", () => {
    const element = document.createElement("div");
    const context = dummyMacroContext(element, "");
    expect(new TitleShortMacro(new MacroConf(), context.props).getName()).toBe("TitleShortMacro");
  });
});