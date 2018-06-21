import { RendererConf } from "../../../src/lib/Configuration";
import { dummyRendererContext } from "../../helpers/fixtures/Assets";
import { OpenRTBUtils } from "../../../src/lib/openrtb/OpenRTBUtils";
import { MainImageRenderer } from "../../../src/lib/vm/renderer/MainImageRenderer";

describe("MainImageRenderer", () => {
  describe("render", () => {
    it("when asset enough", async () => {
      const config = new RendererConf();
      const element = document.createElement("div");
      const target = document.createElement("img");
      target.setAttribute(config.mainImage.selectorAttrName, "");
      element.appendChild(target);
      const context = dummyRendererContext(element);
      await new MainImageRenderer(config).render(context);
      expect(target.src).toBe(OpenRTBUtils.dummyImg);
    });
  });
  it("getName", () => {
    expect(new MainImageRenderer(new RendererConf()).getName()).toBe("MainImageRenderer");
  });
});