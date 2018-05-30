import Configuration from "./Configuration";
import { isObject } from "./Misc";

export default async function main(...args: any[]) {
  if (isObject(args[0]) && !!args[0].version) {
    // execute
  } else {
    throw "abort";
  }
}