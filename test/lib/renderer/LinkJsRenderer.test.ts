import { RendererConf } from "../../../src/lib/Configuration";
import { dummyRendererContext } from "../../helpers/fixtures/Assets";
import { LinkJsRenderer } from "../../../src/lib/vm/renderer/LinkJsRenderer";

describe("LinkJsRenderer", () => {
  describe("render", () => {
    it("when asset enough", async () => {
      const config = new RendererConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.linkJs.selectorAttrName, "");
      element.appendChild(target);
      const context = dummyRendererContext(element);
      await new LinkJsRenderer(config).render(context);
      // expect(element.outerHTML).toBe("..."); // FIXME
    });
  });
  it("getName", () => {
    expect(new LinkJsRenderer(new RendererConf()).getName()).toBe("LinkJsRenderer");
  });
});