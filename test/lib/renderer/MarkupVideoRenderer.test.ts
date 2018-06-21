import { MarkupVideoRenderer } from "../../../src/lib/vm/renderer/MarkupVideoRenderer";
import { RendererConf } from "../../../src/lib/Configuration";

describe("MarkupVideoRenderer", () => {
  describe("render", () => {
    it("when asset enough", async () => {
      const config = new RendererConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.markupVideo.selectorAttrName, "");
      element.appendChild(target);
      // await new MarkupVideoRenderer(config, {}).render(element, dummyRendererContext());
      // expect(element.outerHTML).toBe("..."); // FIXME
    });
  });
  it("getName", () => {
    expect(new MarkupVideoRenderer(new RendererConf()).getName()).toBe("MarkupVideoRenderer");
  });
});