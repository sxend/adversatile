import Configuration, {
  isConfiguration,
  asConfituration,
} from "./Configuration";
import { Plugin } from "./Plugin";
import { isObject } from "./misc/TypeCheck";
import { ViewModel } from "./ViewModel";
import { Action } from "./Action";
import { Store } from "./Store";
import { Dispatcher } from "./Dispatcher";
import pfx from "../plugins/pfx";

export async function main(...args: any[]) {
  if (isObject(args[0]) && isConfiguration(args[0])) {
    await runWithConfiguration(asConfituration(args[0]));
  } else {
    throw "abort";
  }
}

async function runWithConfiguration(configuration: Configuration) {
  const dispatcher: Dispatcher = new Dispatcher();
  const action = new Action(configuration.action, dispatcher);
  const store = new Store(configuration.store, dispatcher);
  new ViewModel(configuration.vm, store, action);
}

export function use(this: any, plugin: Plugin, options?: any) {
  plugin.install(this, options);
}

export function initialize(): Plugin {
  return {
    install: function(Adversatile: { use: (plugin: Plugin) => void, plugin: any }) {
      Adversatile.plugin = Adversatile.plugin || {};
      Adversatile.use(pfx);
    }
  };
}
