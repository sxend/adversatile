import { VideoRenderer } from "../../../src/lib/vm/renderer/VideoRenderer";
import { RendererConf } from "../../../src/lib/Configuration";

describe("VideoRenderer", () => {
  describe("render", () => {
    it("when asset enough", async () => {
      const config = new RendererConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.video.selectorAttrName, "");
      element.appendChild(target);
      // await new VideoRenderer(config, {}).render(element, dummyRendererContext());
      // expect(element.outerHTML).toBe("..."); // FIXME
    });
  });
  it("getName", () => {
    expect(new VideoRenderer(new RendererConf()).getName()).toBe("VideoRenderer");
  });
});