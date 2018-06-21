import { RendererConf } from "../../../src/lib/Configuration";
import { dummyRendererContext } from "../../helpers/fixtures/Assets";
import { OpenRTBUtils } from "../../../src/lib/openrtb/OpenRTBUtils";
import { IconImageRenderer } from "../../../src/lib/vm/renderer/IconImageRenderer";

describe("IconImageRenderer", () => {
  describe("render", () => {
    it("when asset enough", async () => {
      const config = new RendererConf();
      const element = document.createElement("div");
      const target = document.createElement("img");
      target.setAttribute(config.iconImage.selectorAttrName, "");
      element.appendChild(target);
      const context = dummyRendererContext(element);
      await new IconImageRenderer(config).render(context);
      expect(target.src).toBe(OpenRTBUtils.dummyImg);
    });
  });
  it("getName", () => {
    expect(new IconImageRenderer(new RendererConf()).getName()).toBe("IconImageRenderer");
  });
});