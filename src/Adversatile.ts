import { main, use, initialize } from "./lib/Main";
import { assign } from "./lib/misc/ObjectUtils";

const Adversatile = (() => {
  if (!("Adversatile" in window) || !(<any>window)["Adversatile"]) {
    const Adversatile: any = {};
    assign(Adversatile, {
      main: main.bind(Adversatile),
      use: use.bind(Adversatile),
      bridge: {} // external modules
    });
    Object.defineProperty(window, "Adversatile", {
      value: Adversatile,
      writable: false
    });
    Adversatile.use(initialize());
    return Adversatile;
  } else {
    return (<any>window)["Adversatile"];
  }
})();

export default Adversatile;
