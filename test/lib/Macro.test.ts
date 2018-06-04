import Macro from "../../src/lib/Macro";
import Configuration from "../../src/lib/Configuration";

test("Macro", done => {
  const macro = new Macro(new Configuration());
  done();
});
