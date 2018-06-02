import { main, use, initialize } from "./lib/Main";

const Adversatile = (() => {
  if (!("Adversatile" in window)) {
    const Adversatile: any = {};
    Object.assign(Adversatile, {
      main: main.bind(Adversatile),
      use: use.bind(Adversatile)
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
