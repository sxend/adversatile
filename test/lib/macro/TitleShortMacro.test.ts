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
      await new TitleShortMacro(config, {}).applyMacro(element, dummyMacroContext());
      expect(target.textContent).toBe("...");
    });
  });
  it("getName", () => {
    expect(new TitleShortMacro(new MacroConf(), {}).getName()).toBe("TitleShortMacro");
  });
});