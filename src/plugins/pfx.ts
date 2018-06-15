import Configuration, { ElementOption, AssetOption } from "../lib/Configuration";
import { OpenRTB } from "../lib/openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import deepmerge from "deepmerge";
import { AssetUtils } from "../lib/openrtb/OpenRTBUtils";
import { Dom } from "../lib/misc/Dom";
import Analytics from "../lib/misc/Analytics";

declare var window: {
  ProFitX: {
    Global: {
      ready: (fn: Function) => Promise<void>
    }
    NativeAd: {
      RequestAssets: {
        iconImage: Function,
        mainImage: Function,
        titleText: Function,
        descriptiveText: Function,
        sponsoredByMessage: Function
      }
      Main: {
        init: Function,
        render: Function,
        preRender: Function
        setup: Function,
      }
    },
    pa: Function
  }
}
export default {
  install: function(Adversatile: any) {
    window.ProFitX = window.ProFitX || {
      Global: {
        ready: (fn: Function) => Dom.ready(fn)
      },
      NativeAd: {
        RequestAssets: {
          iconImage: AssetUtils.iconImage,
          mainImage: AssetUtils.mainImage,
          titleText: AssetUtils.titleText,
          descriptiveText: AssetUtils.descriptiveText,
          sponsoredByMessage: AssetUtils.sponsoredByMessage
        },
        Main: {
          init: init,
          render: render,
          preRender: preRender,
          setup: setup
        }
      },
      pa: Analytics
    };
    const oldcontext: {
      config: Configuration
    } = <any>{};
    function init(names: any[], assets?: OpenRTB.NativeAd.Request.Assets[][]) {
      names = names.map(name => name.toString());
      if (!oldcontext.config) {
        oldcontext.config = new Configuration();
        oldcontext.config.version = 1;
      }
    };
    function render(oldconfigs: OldConfiguration) {
      if (!oldcontext.config) {
        return;
      }
    }
    function preRender() {
    }
    function setup(className: string, oldconfigs: OldConfiguration[], pageId: number) {
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
          return new AssetOption(getAssetIdByName(asset.name), asset.prop);
        });
        emoption.name = oldconfig.tagId;
        config.vm.em.options[oldconfig.tagId] = emoption;
      });
      Adversatile.main(config).catch(console.error);
    }
    function upgradeElement(element: HTMLElement, config: Configuration, oldconfig: OldConfiguration) {
      element.classList.add("adversatile");
      const name = oldconfig.tagId;
      element.setAttribute(config.vm.em.nameAttributeName, name);
      const qualifier = oldconfig.spotId;
      if (qualifier) {
        element.setAttribute(config.vm.em.qualifierAttributeName, qualifier);
      }
      let template: string = "";
      if (oldconfig.templateHtml) {
        template = oldconfig.templateHtml;
      } else if (oldconfig.templateId) {
        const templateEl = document.getElementById(oldconfig.templateId);
        if (templateEl) {
          template = templateEl.innerHTML;
        }
      }
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
      if (template) {
        if (!config.vm.em.templates[name]) {
          config.vm.em.templates[name] = template;
        }
        if (qualifier) {
          config.vm.em.templates[`${name}-${qualifier}`] = template;
        }
      }
    }
  }
};
function getAssetIdByName(name: string): number {
  if (name === "iconImage") {
    return AssetUtils.getAssetIdByAsset(AssetTypes.ICON_URL);
  }
  if (name === "mainImage") {
    return AssetUtils.getAssetIdByAsset(AssetTypes.IMAGE_URL);
  }
  if (name === "titleText") {
    return AssetUtils.getAssetIdByAsset(AssetTypes.TITLE_SHORT);
  }
  if (name === "descriptionText") {
    return AssetUtils.getAssetIdByAsset(AssetTypes.DESCRIPTIVE_TEXT);
  }
  if (name === "sponsoredByMessage") {
    return AssetUtils.getAssetIdByAsset(AssetTypes.SPONSORED_BY_MESSAGE);
  }
}

interface OldConfiguration {

  version: number;
  elementClass: string;
  spotId: string;
  tagId: string;
  reload: boolean;
  templateId: string;
  templateName: string;
  titleLength: number;
  extendTemplateUrl: string;
  priority: number;
  defaultSponsoredByMessage: string;
  defaultTitleShort: string;
  defaultTitleLong: string;
  expandedClickParams: [{ name: string; value: string | number }];
  isSwipeAd: boolean;
  swipeAdStyle: NativeWebTemplate;
  // adInIframe: boolean;
  templateHtml: string;
  templateHtmlsByPattern: { [id: string]: string };
  preRender: boolean;
  adPoolExpireMillSeconds: number;
  assets: { name: string, prop: any }[];
  onpfxadrender: (ads: any, scope: any) => void;
  onpfxadrendered: (ads: any, adUnit: any, adElement?: HTMLElement) => void;
  onpfxadinview: () => void;
  onpatternselected: (pattern: any, tag: any, scope: any) => void;
  displayAreaParentNode: (pattern: any, tag: any, scope: any) => Node;
  adjustDisplayArea: (pattern: any, tag: any, scope: any) => void;
  // pfxImgClassName: string;
  plugin: string;
  adFormat: string; // banner or video or native
  activeOverlaySetting: ActiveOverlaySetting;
  sdkIntegrationSetting: SDKIntegrationSetting;
  notrim: boolean;
  videoSetting: IVideoSetting;

}
interface ActiveOverlaySetting {
  enabled: boolean;
  appearancePercentageFromBottom: number;
  transitionSeconds: number;
  initialOpacity: number;
  scrollEndMillis: number;
  zIndex: number;
  enableExpandFullWidth: boolean;
  enableFixToTopAtScrollEnded: boolean;
}
interface SDKIntegrationSetting {
  enabled: boolean;
}
interface IVideoSetting {
  autoReplay: boolean;
  replayDelayMillis: number;
}
interface NativeWebTemplate {
  adsContainer: string;
  adContainer: string;
  adTemplate: string;
  adSize: SwipeAdSize;
}
interface SwipeAdSize {
  adWidth: number;
  adHeight: number;
}