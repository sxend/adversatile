import { MacroOps } from "../../src/lib/em/renderer/MacroOps";
import { MacroConf } from "../../src/lib/Configuration";

test("MacroOps", done => {
  const macro = new MacroOps(new MacroConf());
  expect(macro).toBeDefined();
  done();
});
