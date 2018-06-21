import { RendererConf } from "../../src/lib/Configuration";
import { RootRenderer } from "../../src/lib/vm/Renderer";

test("RootRenderer", done => {
  const renderer = new RootRenderer(new RendererConf());
  expect(renderer).toBeDefined();
  done();
});
