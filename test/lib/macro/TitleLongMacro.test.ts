import { TitleLongMacro } from "../../../src/lib/vm/renderer/macro/TitleLongMacro";
import { MacroConf } from "../../../src/lib/Configuration";
import { dummyMacroContext } from "../../helpers/fixtures/Assets";

describe("TitleLongMacro", () => {
  describe("applyMacro", () => {
    it("when asset enough", async () => {
      const config = new MacroConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.titleLong.selectorAttrName, "");
      element.appendChild(target);
      const context = dummyMacroContext(element, "");
      await new TitleLongMacro(config, context.props).applyMacro(context);
      expect(target.textContent).toBe("...");
    });
  });
  it("getName", () => {
    const element = document.createElement("div");
    const context = dummyMacroContext(element, "");
    expect(new TitleLongMacro(new MacroConf(), context.props).getName()).toBe("TitleLongMacro");
  });
});