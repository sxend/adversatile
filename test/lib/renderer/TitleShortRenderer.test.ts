import { TitleShortRenderer } from "../../../src/lib/vm/renderer/TitleShortRenderer";
import { RendererConf } from "../../../src/lib/Configuration";
import { dummyRendererContext } from "../../helpers/fixtures/Assets";

describe("TitleShortRenderer", () => {
  describe("render", () => {
    it("when asset enough", async () => {
      const config = new RendererConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.titleShort.selectorAttrName, "");
      element.appendChild(target);
      const context = dummyRendererContext(element);
      await new TitleShortRenderer(config).render(context);
      expect(target.textContent).toBe("...");
    });
  });
  it("getName", () => {
    expect(new TitleShortRenderer(new RendererConf()).getName()).toBe("TitleShortRenderer");
  });
});