import Macro from "./lib/Macro";
import ViewModel from "./lib/ViewModel";
import EventBus from "./lib/EventBus";
import { isArray } from "./lib/Misc";

interface WindowAdversatile {
  q?: Function[];
}
declare var window: {
  adversatile?: WindowAdversatile;
};

function init(adversatile: WindowAdversatile) {
  const q = adversatile.q = adversatile.q || [];
  while (q.length > 0) {
    try {
      q.shift()(Adversatile);
    } catch (e) { }
  }
}
async function main(configuration: any) { }
const Adversatile = {
  Macro,
  EventBus,
  main
};

export default Adversatile;

init((window.adversatile = window.adversatile || {}));
