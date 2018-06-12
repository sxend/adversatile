import { OptoutLinkOnlyMacro } from "../../../src/lib/macro/OptoutLinkOnlyMacro";
import { MacroConf } from "../../../src/lib/Configuration";
import { dummyMacroContext } from "../../helpers/fixtures/Assets";

describe("OptoutLinkOnlyMacro", () => {
  describe("applyMacro", () => {
    it("when asset enough", async () => {
      const config = new MacroConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.optoutLinkOnly.selectorAttrName, "");
      element.appendChild(target);
      await new OptoutLinkOnlyMacro(config, {}).applyMacro(element, dummyMacroContext());
      const anchor = element.querySelector("a");
      expect(anchor).toBeDefined();
      expect(anchor.firstChild).toBeDefined();
    });
  });
  it("getName", () => {
    expect(new OptoutLinkOnlyMacro(new MacroConf(), {}).getName()).toBe("OptoutLinkOnlyMacro");
  });
});