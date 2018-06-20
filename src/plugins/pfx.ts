import Configuration, { ElementOption, AssetOption } from "../lib/Configuration";
import { OpenRTB } from "../lib/openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { OpenRTBUtils } from "../lib/openrtb/OpenRTBUtils";
import { Dom } from "../lib/misc/Dom";
import Analytics from "../lib/misc/Analytics";
import { ElementModel } from "../lib/vm/ElementModel";
import { getOrElse, assign } from "../lib/misc/ObjectUtils";
import { MacroOps, MacroContext } from "../lib/vm/renderer/Macro";
import { Renderer, RendererContext } from "../lib/vm/Renderer";
import { AssetUtils } from "../lib/openrtb/AssetUtils";

declare var window: {
  onpfxadrendered: Function,
  onpfxadload: Function,
  ProFitX: {
    Global: {
      ready: (fn: Function) => Promise<void>
      ifa: string
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
  },
  postMessage: Function
}
export default {
  install: function(Adversatile: any) {
    window.ProFitX = window.ProFitX || <any>{};
    const ProFitX = Adversatile.ProFitX = window.ProFitX = assign(window.ProFitX, {
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
    });
    const oldcontext: {
      config: Configuration
      oldconfigs: OldConfiguration[]
      assets: OpenRTB.NativeAd.Request.Assets[][]
    } = <any>{};
    function init(names: any[], assets?: OpenRTB.NativeAd.Request.Assets[][]) {
      names = names.map(name => name.toString());
      if (!oldcontext.config) {
        oldcontext.config = new Configuration();
        oldcontext.config.version = 1;
        oldcontext.assets = assets;
      }
    };
    function render(oldconfigs: OldConfiguration[]) {
      if (!oldcontext.config) {
        oldcontext.oldconfigs = oldconfigs;
        return;
      }
    }
    function preRender() {
    }
    function setup(className: string, oldconfigs: OldConfiguration[], pageId?: number) {
      console.log("adv setup");
      const config = new Configuration();
      config.version = 1;
      config.vm.selector = `.${className}`;
      config.vm.deviceIfaAttrName = "data-ca-profitx-device-ifa";
      config.action.fetchCallbackPrefix = "pfxCallback_";
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
      oldconfigs.forEach(oldconfig => upgradeConfig(config, oldconfig));
      config.vm.em.groupAttributeName = 'data-ca-profitx-pageid';
      const page = document.querySelector('[data-ca-profitx-pageid]');
      pageId = page ? Number(page.getAttribute('data-ca-profitx-pageid')) : pageId;
      config.vm.em.defaultGroup = String(pageId);
      config.vm.em.plugins.push({
        install: function(model: ElementModel) {
          config.vm.em.defaultGroup = model.group;
        }
      })
      config.vm.em.plugins.push({
        install: function(model: ElementModel) {
          try {
            const oldconfig = oldconfigs.find(x => x.tagId === model.name);
            model.on("render", function render(context: RendererContext) {
              if (OpenRTBUtils.isDummyBid(context.bid)) return;
              if (window.onpfxadload) {
                window.onpfxadload(context.bid);
              }
            });
            model.on("rendered", function rendered(context: RendererContext) {
              if (OpenRTBUtils.isDummyBid(context.bid)) return;
              if (oldconfig && oldconfig.onpfxadrendered) {
                oldconfig.onpfxadrendered(context.bid, null, context.element);
              }
              if (window.onpfxadrendered) {
                window.onpfxadrendered(context.model.qualifier);
              }
              model.removeListener("rendered", rendered);
            });
            model.once("impression", () => {
              window.postMessage('onpfximpression', '*');
            });
            model.once("viewable_impression", () => {
              if (oldconfig && oldconfig.onpfxadinview) {
                oldconfig.onpfxadinview();
              }
              window.postMessage('onpfxviewableImpression', '*');
            });
          } catch (e) {
            console.error(e);
          }
        }
      });
      config.vm.em.renderer.plugins.push({
        install: function(renderer: Renderer) {
          const original = renderer.render;
          renderer.render = function(context: RendererContext) {
            try {
              let html = getOrElse(() => context.bid.ext.bannerHtml);
              if (html) {
                const replacements: any = {
                  "${PFX_AD_SCALE_RATIO}": "{{model.option.renderer.adScaleRatio}}",
                  "${PFX_VIEWPORT_WIDTH}": "{{model.option.renderer.viewPortWidth}}"
                };
                const bidderName = getOrElse(() => context.bid.ext.bidderName, "");
                if (bidderName === "ydn") { // when change here, check also insertNoAdCallbackForBanner
                  replacements["${PFX_YDN_NOADCALLBACK}"] = [
                    '<scr' + 'ipt>',
                    `yads_noad_callback = 'parent.PFX_YDN_NOADCALLBACK_TAG${context.model.name}';`,
                    '</sc' + 'ript>'
                  ].join('\n');
                }
                const pattern = /\$\{[A-Z_]+\}/ig;
                html = html.replace(pattern, matched => {
                  return replacements[matched] || "";
                });
                context.bid.ext.bannerHtml = html;
              }
            } catch (e) {
              console.error(e);
            }
            return original.call(renderer, context);
          };
        }
      });
      config.vm.em.macro.plugins.push({
        install: function(macroops: MacroOps) {
          const original = macroops.applyMacro;
          macroops.applyMacro = function(context: MacroContext) {
            if (context.model.option.format === "banner") {
              context.element.setAttribute(config.vm.em.macro.inject.selectorAttrName, "iframe");
            }
            return original.call(macroops, context);
          };
        }
      });
      config.vm.em.macro.plugins.push({
        install: function(macroops: MacroOps) {
          const original = macroops.applyMacro;
          macroops.applyMacro = function(context: MacroContext) {
            try {
              let html = getOrElse(() => context.bid.ext.bannerHtml);
              if (html) {
                context.template = upgradeTemplate(context.template.replace("${PFX_BANNER_HTML}", "{{bid.ext.bannerHtml}}"), config);
              }
            } catch (e) {
              console.error(e);
            }
            return original.call(macroops, context);
          };
        }
      });
      config.vm.em.macro.bannerAd.impSelector = 'a[href*="ad.caprofitx.adtdp.com"],img[src]';
      config.vm.em.macro.link.selectorAttrName = "data-pfx-link";
      config.vm.em.macro.link.markedClass = "pfx-link-added";
      config.vm.em.macro.link.anchorMarkedClass = "pfx-anchor-link";
      config.vm.em.macro.linkJs.selectorAttrName = "data-pfx-link-js";
      config.vm.em.macro.mainImage.selectorAttrName = "data-pfx-img";
      config.vm.em.macro.iconImage.selectorAttrName = "data-pfx-icon";
      config.vm.em.macro.titleLong.selectorAttrName = "data-pfx-title-long";
      config.vm.em.macro.titleShort.selectorAttrName = "data-pfx-title-short";
      config.vm.em.macro.optoutLinkOnly.selectorAttrName = "data-pfx-optout-link-only";
      config.vm.em.macro.optoutLink.selectorAttrName = "data-pfx-optout-link";
      config.vm.em.macro.sponsoredByMessage.selectorAttrName = "data-pfx-sponsored-by-message";
      config.vm.em.macro.video.selectorAttrName = "data-pfx-video";
      Adversatile.main(config).catch(console.error);
    }
    function upgradeConfig(config: Configuration, oldconfig: OldConfiguration): void {
      const name = oldconfig.tagId;
      const qualifier = oldconfig.spotId;
      const emoption = config.vm.em.options[name] = new ElementOption(name);
      emoption.expandedClickParams = oldconfig.expandedClickParams;
      emoption.notrim = oldconfig.notrim;
      emoption.preRender = oldconfig.preRender;
      emoption.format = oldconfig.adFormat;
      emoption.assets = (oldconfig.assets || []).map(asset => {
        return new AssetOption(getAssetIdByName(asset.name), asset.prop);
      });
      let template: string = "";
      if (oldconfig.templateHtml) {
        template = oldconfig.templateHtml;
      } else if (oldconfig.templateId) {
        const templateEl = document.getElementById(oldconfig.templateId);
        if (templateEl) {
          template = templateEl.innerHTML;
        }
      }
      template = upgradeTemplate(template, config);
      if (template) {
        if (!config.vm.em.templates[name]) {
          config.vm.em.templates[name] = template;
        }
        if (qualifier) {
          config.vm.em.templates[qualifier] = template;
        }
      }
    }
    function upgradeTemplate(template: string = "", config: Configuration): string {
      template = template.replace(/data-pfx-link-self/g, `${config.vm.em.macro.link.anchorTargetAttrName}="_self"`);
      template = template.replace(/data-pfx-link-top/g, `${config.vm.em.macro.link.anchorTargetAttrName}="_top"`);
      template = template.replace(/data-pfx-link-blank/g, `${config.vm.em.macro.link.anchorTargetAttrName}="_blank"`);
      template = template.replace(/data-pfx-link-parent/g, `${config.vm.em.macro.link.anchorTargetAttrName}="_parent"`);
      return template;
    }
    function upgradeElement(element: HTMLElement, config: Configuration, oldconfig: OldConfiguration): void {
      const name = oldconfig.tagId;
      element.setAttribute(config.vm.em.nameAttributeName, name);
      const qualifier = oldconfig.spotId;
      if (qualifier) {
        element.setAttribute(config.vm.em.qualifierAttributeName, qualifier);
      }
    }
    Adversatile.use({
      install: function(adv: any) {
        adv.plugin.bridge = adv.plugin.bridge || {};
        setInterval(() => {
          if (ProFitX.Global.ifa) {
            adv.plugin.bridge.ifa = ProFitX.Global.ifa;
          }
        }, 50);
      }
    });
  }
};
function getAssetIdByName(name: string): number | undefined {
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
  return void 0;
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
  maxVideoPlayTotalNth: number;
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
  playLimitCount: number;
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