import { SponsoredByMessageRenderer } from "../../../src/lib/vm/renderer/SponsoredByMessageRenderer";
import { RendererConf } from "../../../src/lib/Configuration";
import { dummyRendererContext } from "../../helpers/fixtures/Assets";

describe("SponsoredByMessageRenderer", () => {
  describe("render", () => {
    it("when asset enough", async () => {
      const config = new RendererConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.sponsoredByMessage.selectorAttrName, "");
      element.appendChild(target);
      const context = dummyRendererContext(element);
      await new SponsoredByMessageRenderer(config).render(context);
      expect(target.innerHTML).toBe("...");
    });
  });
  it("getName", () => {
    expect(new SponsoredByMessageRenderer(new RendererConf()).getName()).toBe("SponsoredByMessageRenderer");
  });
});