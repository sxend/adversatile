import Configuration, {
  isConfiguration,
  asConfituration
} from "./Configuration";
import { Plugin } from "./Plugin";
import { isObject } from "./Misc";

export async function main(...args: any[]) {
  if (isObject(args[0]) && isConfiguration(args[0])) {
    runWithConfiguration(asConfituration(args[0]));
  } else {
    throw "abort";
  }
}

export function use(plugin: Plugin, options?: any) {
  plugin.install(this, options);
}

export function initialize(): Plugin {
  return {
    install: function(Adversatile: any, options: any) {
      Adversatile.plugin = Adversatile.plugin || {};
      Adversatile.use(PollingPlugin());
      Adversatile.use(RequirePlugin());
    }
  };
}
function RequirePlugin() {
  return {
    install: function(Adversatile: any, options: any = {}) {
      function _require(names: string[], callback: Function) {
        Adversatile.plugin.polling.queue.push(function observe() {
          if (names.every(name => Adversatile.plugin[name])) {
            callback();
          } else {
            Adversatile.plugin.polling.queue.push(observe);
          }
        });
      }
      Adversatile.plugin.require = _require;
    }
  };
}
function PollingPlugin() {
  return {
    install: function(Adversatile: any, options: any = {}) {
      Adversatile.plugin.polling = Object.assign(options, {
        interval: 100,
        queue: []
      });
      setTimeout(function polling() {
        while (Adversatile.plugin.polling.queue.length > 0) {
          Adversatile.plugin.polling.queue.shift()();
        }
        setTimeout(polling, Adversatile.plugin.polling.interval);
      }, Adversatile.plugin.polling.interval);
    }
  };
}
async function runWithConfiguration(configuration: Configuration) {
  console.log("runWithConfiguration");
}
