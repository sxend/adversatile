import { OptoutLinkOnlyRenderer } from "../../../src/lib/vm/renderer/OptoutLinkOnlyRenderer";
import { RendererConf } from "../../../src/lib/Configuration";
import { dummyRendererContext } from "../../helpers/fixtures/Assets";

describe("OptoutLinkOnlyRenderer", () => {
  describe("render", () => {
    it("when asset enough", async () => {
      const config = new RendererConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.optoutLinkOnly.selectorAttrName, "");
      element.appendChild(target);
      const context = dummyRendererContext(element);
      await new OptoutLinkOnlyRenderer(config).render(context);
      const anchor = element.querySelector("a");
      expect(anchor).toBeDefined();
      expect(anchor.firstChild).toBeDefined();
    });
  });
  it("getName", () => {
    expect(new OptoutLinkOnlyRenderer(new RendererConf()).getName()).toBe("OptoutLinkOnlyRenderer");
  });
});