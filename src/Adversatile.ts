import Contiguration from "./lib/Configuration";
import { isObject } from "./lib/Misc";
import main from "./lib/Main";

async function absorber(...args: any[]) {
  if (isObject(args[0]) && !!args[0].version) {
    main(args[0]);
  } else {
    throw "abort";
  }
}

const Adversatile = {
  main: absorber
};

export default Adversatile;

const __global = (0, eval)('this');

__global.Adversatile = __global.Adversatile || Adversatile;
