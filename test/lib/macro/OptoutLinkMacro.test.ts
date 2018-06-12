import { OptoutLinkMacro } from "../../../src/lib/macro/OptoutLinkMacro";
import { MacroConf } from "../../../src/lib/Configuration";
import { dummyMacroContext } from "../../helpers/fixtures/Assets";

describe("OptoutLinkMacro", () => {
  describe("applyMacro", () => {
    it("when asset enough", async () => {
      const config = new MacroConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.optoutLink.selectorAttrName, "");
      element.appendChild(target);
      await new OptoutLinkMacro(config, {}).applyMacro(element, dummyMacroContext());
      const anchor = element.querySelector("a");
      expect(anchor).toBeDefined();
      const img = anchor.querySelector("img");
      expect(img).toBeDefined();
    });
  });
  it("getName", () => {
    expect(new OptoutLinkMacro(new MacroConf(), {}).getName()).toBe("OptoutLinkMacro");
  });
});