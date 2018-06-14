import Configuration, {
  isConfiguration,
  asConfituration,
  ElementOption,
  AssetOption
} from "./Configuration";
import { Plugin } from "./Plugin";
import { isObject, isString } from "./misc/TypeCheck";
import { ViewModel } from "./ViewModel";
import { Action } from "./Action";
import { Store } from "./Store";
import { EventEmitter } from "events";
import { Dispatcher } from "./Dispatcher";
import { OpenRTB } from "./openrtb/OpenRTB";
import Adversatile from "../Adversatile";
import { OldConfiguration } from "./OldConfiguration";

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

const oldcontext: {
  config: Configuration
} = <any>{};
export function init(names: any[], assets?: OpenRTB.NativeAd.Request.Assets[][]) {
  names = names.map(name => name.toString());
  console.log("init");
  if (!oldcontext.config) {
    oldcontext.config = new Configuration();
    oldcontext.config.version = 1;
  }
}
export function render(oldconfigs: OldConfiguration) {
  console.log("render");
  if (!oldcontext.config) {
    console.warn("render call after init");
    return;
  }
}
export function setup(className: string, oldconfigs: OldConfiguration[], pageId: number) {
  console.log("setup");
  const config = new Configuration();
  config.version = 1;
  [].slice.call(document.querySelectorAll(`.${className}`)).forEach((oldElement: HTMLElement) => {
    const element = document.createElement("div");
    [].slice.call(oldElement.attributes).forEach((attribute: { name: string, value: string }) => {
      element.setAttribute(attribute.name, attribute.value);
      const spotId = element.getAttribute("data-ca-profitx-spotid");
      const tagId = element.getAttribute("data-ca-profitx-tagid");
      if (spotId) {
        const oldconfig = oldconfigs.filter(config => config.spotId === spotId)[0];
        if (oldconfig) {
          upgradeElement(element, config, oldconfig);
        }
      } else {
        const oldconfig = oldconfigs.filter(config => config.tagId === tagId)[0];
        if (oldconfig) {
          upgradeElement(element, config, oldconfig);
        }
      }
    });
    oldElement.parentElement.insertBefore(element, oldElement);
    oldElement.parentElement.removeChild(oldElement);
  });
  oldconfigs.map(oldconfig => {
    const emoption = new ElementOption(oldconfig.tagId);
    emoption.expandedClickParams = oldconfig.expandedClickParams;
    emoption.notrim = oldconfig.notrim;
    emoption.preRender = oldconfig.preRender;
    emoption.format = oldconfig.adFormat;
    emoption.assets = (oldconfig.assets || []).map(asset => {
      const asoption = new AssetOption();
      asoption.name = asset.name;
      asoption.prop = asset.prop;
      return asoption;
    });
    emoption.name = oldconfig.tagId;
    config.vm.em.options[oldconfig.tagId] = emoption;
  });
  config.vm.selector = `.${className}`;
  main(config).catch(console.error);
}
function upgradeElement(element: HTMLElement, config: Configuration, oldconfig: OldConfiguration) {
  element.classList.add("adversatile");
  const name = oldconfig.tagId;
  element.setAttribute(config.vm.em.nameAttributeName, name);
  if (oldconfig.templateId) {
    const templateEl = document.getElementById(oldconfig.templateId);
    if (templateEl) {
      let template = templateEl.innerHTML || "";
      template = template.replace(/data-pfx-link/g, config.vm.em.macro.link.selectorAttrName);
      template = template.replace(/data-pfx-link-js/g, config.vm.em.macro.linkJs.selectorAttrName);
      template = template.replace(/data-pfx-img/g, config.vm.em.macro.mainImage.selectorAttrName);
      template = template.replace(/data-pfx-icon/g, config.vm.em.macro.iconImage.selectorAttrName);
      template = template.replace(/data-pfx-title-long/g, config.vm.em.macro.titleLong.selectorAttrName);
      template = template.replace(/data-pfx-title-short/g, config.vm.em.macro.titleShort.selectorAttrName);
      template = template.replace(/data-pfx-optout-link-only/g, config.vm.em.macro.optoutLinkOnly.selectorAttrName);
      template = template.replace(/data-pfx-optout-link/g, config.vm.em.macro.optoutLink.selectorAttrName);
      template = template.replace(/data-pfx-sponsored-by-message/g, config.vm.em.macro.sponsoredByMessage.selectorAttrName);
      template = template.replace(/data-pfx-video/g, config.vm.em.macro.video.selectorAttrName);

      template = template.replace(/data-pfx-link-self/g, `${config.vm.em.macro.link.anchorTargetAttrName}="_self"`);
      template = template.replace(/data-pfx-link-top/g, `${config.vm.em.macro.link.anchorTargetAttrName}="_top"`);
      template = template.replace(/data-pfx-link-blank/g, `${config.vm.em.macro.link.anchorTargetAttrName}="_blank"`);
      template = template.replace(/data-pfx-link-parent/g, `${config.vm.em.macro.link.anchorTargetAttrName}="_parent"`);

      config.vm.em.templates[name] = template;
    }
  }

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
