import { TitleLongMacro } from "../../../src/lib/macro/TitleLongMacro";
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
      await new TitleLongMacro(config, {}).applyMacro(element, dummyMacroContext());
      expect(target.textContent).toBe("...");
    });
  });
  it("getName", () => {
    expect(new TitleLongMacro(new MacroConf(), {}).getName()).toBe("TitleLongMacro");
  });
});