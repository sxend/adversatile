import Macro from "../../src/lib/Macro";
import Configuration, { MacroConf } from "../../src/lib/Configuration";

test("Macro", done => {
  const macro = new Macro(new MacroConf());
  done();
});
