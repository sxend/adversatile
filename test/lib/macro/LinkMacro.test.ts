import { LinkMacro } from "../../../src/lib/macro/LinkMacro";
import { MacroConf } from "../../../src/lib/Configuration";
import { dummyMacroContext } from "../../helpers/fixtures/Assets";

describe("LinkMacro", () => {
  describe("applyMacro", () => {
    it("when asset enough", async () => {
      const config = new MacroConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.link.selectorAttrName, "");
      element.appendChild(target);
      await new LinkMacro(config, {}).applyMacro(element, dummyMacroContext());
      expect(element.querySelector("a")).toBeDefined();
    });
  });
  it("getName", () => {
    expect(new LinkMacro(new MacroConf(), {}).getName()).toBe("LinkMacro");
  });
});