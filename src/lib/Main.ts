import Configuration, { isConfiguration, asConfituration } from "./Configuration";
import { isObject } from "./Misc";

export default async function main(...args: any[]) {
  if (isObject(args[0]) && isConfiguration(args[0])) {
    runWithConfiguration(asConfituration(args[0]));
  } else {
    throw "abort";
  }
}
async function runWithConfiguration(configuration: Configuration) {
}