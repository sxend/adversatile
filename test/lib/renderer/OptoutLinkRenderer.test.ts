import { OptoutLinkRenderer } from "../../../src/lib/vm/renderer/OptoutLinkRenderer";
import { RendererConf } from "../../../src/lib/Configuration";
import { dummyRendererContext } from "../../helpers/fixtures/Assets";

describe("OptoutLinkRenderer", () => {
  describe("render", () => {
    it("when asset enough", async () => {
      const config = new RendererConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.optoutLink.selectorAttrName, "");
      element.appendChild(target);
      const context = dummyRendererContext(element);
      await new OptoutLinkRenderer(config).render(context);
      const anchor = element.querySelector("a");
      expect(anchor).toBeDefined();
      const img = anchor.querySelector("img");
      expect(img).toBeDefined();
    });
  });
  it("getName", () => {
    expect(new OptoutLinkRenderer(new RendererConf()).getName()).toBe("OptoutLinkRenderer");
  });
});