import main from "./lib/Main";

const Adversatile = { main };

export default Adversatile;

async function expose() {
  if (!!window && !("Adversatile" in window)) {
    Object.defineProperty(window, "Adversatile", {
      value: Adversatile,
      writable: false
    });
  }
}

expose();