import { TitleLongRenderer } from "../../../src/lib/vm/renderer/TitleLongRenderer";
import { RendererConf } from "../../../src/lib/Configuration";
import { dummyRendererContext } from "../../helpers/fixtures/Assets";

describe("TitleLongRenderer", () => {
  describe("render", () => {
    it("when asset enough", async () => {
      const config = new RendererConf();
      const element = document.createElement("div");
      const target = document.createElement("div");
      target.setAttribute(config.titleLong.selectorAttrName, "");
      element.appendChild(target);
      const context = dummyRendererContext(element);
      await new TitleLongRenderer(config).render(context);
      expect(target.textContent).toBe("...");
    });
  });
  it("getName", () => {
    expect(new TitleLongRenderer(new RendererConf()).getName()).toBe("TitleLongRenderer");
  });
});