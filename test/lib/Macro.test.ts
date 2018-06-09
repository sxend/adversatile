import {MacroOps} from "../../src/lib/MacroOps";
import Configuration, { MacroConf } from "../../src/lib/Configuration";

test("MacroOps", done => {
  const macro = new MacroOps(new MacroConf());
  done();
});
