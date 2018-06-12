import { SponsoredByMessageMacro } from "../../../src/lib/macro/SponsoredByMessageMacro";
import { MacroConf } from "../../../src/lib/Configuration";
import { dummyMacroContext } from "../../helpers/fixtures/Assets";

describe("SponsoredByMessageMacro", () => {
  describe("applyMacro", () => {
    it("when asset enough", async () => {
      const config = new MacroConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.sponsoredByMessage.selectorAttrName, "");
      element.appendChild(target);
      await new SponsoredByMessageMacro(config, {}).applyMacro(element, dummyMacroContext());
      expect(target.innerHTML).toBe("...");
    });
  });
  it("getName", () => {
    expect(new SponsoredByMessageMacro(new MacroConf(), {}).getName()).toBe("SponsoredByMessageMacro");
  });
});