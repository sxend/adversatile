import Configuration, {
  isConfiguration,
  asConfituration
} from "./Configuration";
import { Plugin } from "./Plugin";
import { isObject } from "./misc/TypeCheck";
import ViewModel from "./ViewModel";

export async function main(...args: any[]) {
  if (isObject(args[0]) && isConfiguration(args[0])) {
    runWithConfiguration(asConfituration(args[0]));
  } else {
    throw "abort";
  }
}

async function runWithConfiguration(configuration: Configuration) {
  new ViewModel(configuration);
}

export function use(plugin: Plugin, options?: any) {
  plugin.install(this, options);
}

export function initialize(): Plugin {
  return {
    install: function(Adversatile: any, options: any) {
      Adversatile.plugin = Adversatile.plugin || {};
    }
  };
}