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
      const context = dummyMacroContext(element, "");
      await new SponsoredByMessageMacro(config, context.props).applyMacro(context);
      expect(target.innerHTML).toBe("...");
    });
  });
  it("getName", () => {
    const element = document.createElement("div");
const context = dummyMacroContext(element, "");
    expect(new SponsoredByMessageMacro(new MacroConf(), context.props).getName()).toBe("SponsoredByMessageMacro");
  });
});