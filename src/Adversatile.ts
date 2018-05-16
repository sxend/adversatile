import Macro from "./lib/Macro";
import ViewModel from "./lib/ViewModel";
import EventBus from "./lib/EventBus";

declare var window: {
  adversatile: any
};

const Adversatile = {
  Macro,
  EventBus
};

export default Adversatile;

const adversatile = window.adversatile = window.adversatile || {};
adversatile.q = adversatile.q || [];

async function main() {
}
main();