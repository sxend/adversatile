import { main, init, render, setup, use, initialize } from "./lib/Main";

const Adversatile = (() => {
  if (!("Adversatile" in window) || !(<any>window)["Adversatile"]) {
    const Adversatile: any = {};
    Object.assign(Adversatile, {
      init: init.bind(Adversatile),
      render: render.bind(Adversatile),
      setup: setup.bind(Adversatile),
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
