import { RendererConf } from "../../../src/lib/Configuration";
import { dummyRendererContext } from "../../helpers/fixtures/Assets";
import { LinkRenderer } from "../../../src/lib/vm/renderer/LinkRenderer";

describe("LinkRenderer", () => {
  describe("render", () => {
    it("when asset enough", async () => {
      const config = new RendererConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.link.selectorAttrName, "");
      element.appendChild(target);
      const context = dummyRendererContext(element);
      await new LinkRenderer(config).render(context);
      expect(element.querySelector("a")).toBeDefined();
    });
  });
  it("getName", () => {
    expect(new LinkRenderer(new RendererConf()).getName()).toBe("LinkRenderer");
  });
});