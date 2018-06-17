import { LinkMacro } from "../../../src/lib/vm/renderer/macro/LinkMacro";
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
      const context = dummyMacroContext(element, "");
      await new LinkMacro(config, context.props).applyMacro(context);
      expect(element.querySelector("a")).toBeDefined();
    });
  });
  it("getName", () => {
    const element = document.createElement("div");
    const context = dummyMacroContext(element, "");
    expect(new LinkMacro(new MacroConf(), context.props).getName()).toBe("LinkMacro");
  });
});