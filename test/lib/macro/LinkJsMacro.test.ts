import { LinkJsMacro } from "../../../src/lib/macro/LinkJsMacro";
import { MacroConf } from "../../../src/lib/Configuration";
import { dummyMacroContext } from "../../helpers/fixtures/Assets";

describe("LinkJsMacro", () => {
  describe("applyMacro", () => {
    it("when asset enough", async () => {
      const config = new MacroConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.linkJs.selectorAttrName, "");
      element.appendChild(target);
      await new LinkJsMacro(config, {}).applyMacro(element, dummyMacroContext());
      // expect(element.outerHTML).toBe("..."); // FIXME
    });
  });
  it("getName", () => {
    expect(new LinkJsMacro(new MacroConf(), {}).getName()).toBe("LinkJsMacro");
  });
});