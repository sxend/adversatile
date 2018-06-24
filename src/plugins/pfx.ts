import Configuration, { ElementOption, AssetOption } from "../lib/Configuration";
import { OpenRTB } from "../lib/openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { OpenRTBUtils } from "../lib/openrtb/OpenRTBUtils";
import { Dom } from "../lib/misc/Dom";
import Analytics from "../lib/misc/Analytics";
import { ElementModel } from "../lib/vm/ElementModel";
import { getOrElse, assign, onceFunction } from "../lib/misc/ObjectUtils";
import { AssetUtils } from "../lib/openrtb/AssetUtils";
import { Renderer, RendererContext } from "../lib/vm/Renderer";
import { BannerAdRenderer } from "../lib/vm/renderer/BannerAdRenderer";
import { RandomId } from "../lib/misc/RandomId";

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
    const config = new Configuration();
    config.version = 1;
    config.vm.deviceIfaAttrName = "data-ca-profitx-device-ifa";
    config.action.backend.fetchCallbackPrefix = "pfxCallback_";
    config.vm.em.groupAttributeName = 'data-ca-profitx-pageid';
    const _oldconfigs: OldConfiguration[] = [];
    config.vm.em.plugins.push({
      install: function(model: ElementModel) {
        try {
          model.on("render", function render(context: RendererContext) {
            if (OpenRTBUtils.isDummyBid(context.bid)) return;
            if (window.onpfxadload) {
              window.onpfxadload(context.bid);
            }
          });
          model.on("rendered", function rendered(context: RendererContext) {
            if (OpenRTBUtils.isDummyBid(context.bid) || context.bid.ext.disabled) return;
            const oldconfig = _oldconfigs.find(x => x.tagId === context.bid.ext.tagid);
            if (oldconfig && oldconfig.onpfxadrendered) {
              oldconfig.onpfxadrendered(context.bid, null, context.element);
            }
            if (window.onpfxadrendered) {
              window.onpfxadrendered(context.model.qualifier);
            }
          });
          model.on("impression", () => {
            window.postMessage('onpfximpression', '*');
          });
          model.on("viewable_impression", (bid: OpenRTB.Bid) => {
            const oldconfig = _oldconfigs.find(x => x.tagId === bid.ext.tagid);
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
        if (renderer.getName() !== BannerAdRenderer.NAME) return;
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
    config.vm.em.renderer.plugins.push({
      install: function(renderer: Renderer) {
        if (renderer.getName() !== BannerAdRenderer.NAME) return;
        const original = renderer.render;
        renderer.render = function(context: RendererContext) {
          try {
            let html = getOrElse(() => context.bid.ext.bannerHtml);
            if (html) {
              context.template = upgradeTemplate(context.template.replace("${PFX_BANNER_HTML}", "{{bid.ext.bannerHtml}}"), config);
            }
          } catch (e) {
            console.error(e);
          }
          return original.call(renderer, context);
        };
      }
    });
    config.vm.em.renderer.bannerAd.impSelector = 'a[href*="ad.caprofitx.adtdp.com"],img[src]';
    config.vm.em.renderer.link.selectorAttrName = "data-pfx-link";
    config.vm.em.renderer.link.markedClass = "pfx-link-added";
    config.vm.em.renderer.link.anchorMarkedClass = "pfx-anchor-link";
    config.vm.em.renderer.linkJs.selectorAttrName = "data-pfx-link-js";
    config.vm.em.renderer.mainImage.selectorAttrName = "data-pfx-img";
    config.vm.em.renderer.iconImage.selectorAttrName = "data-pfx-icon";
    config.vm.em.renderer.titleLong.selectorAttrName = "data-pfx-title-long";
    config.vm.em.renderer.titleShort.selectorAttrName = "data-pfx-title-short";
    config.vm.em.renderer.optoutLinkOnly.selectorAttrName = "data-pfx-optout-link-only";
    config.vm.em.renderer.optoutLink.selectorAttrName = "data-pfx-optout-link";
    config.vm.em.renderer.sponsoredByMessage.selectorAttrName = "data-pfx-sponsored-by-message";
    config.vm.em.renderer.video.selectorAttrName = "data-pfx-video";
    let runMain = onceFunction(() => Adversatile.main(config).catch(console.error));
    let firstPageIdDetect = true;
    function setup(className: string, oldconfigs: OldConfiguration[], pageId?: number) {
      console.log("adv setup");
      runMain();
      Dom.TopLevelWindow.then(w => {
        config.vm.selector = `.${className}`;
        const existsPageId = !!pageId;
        if (existsPageId) {
          if (firstPageIdDetect) {
            const page = <Element>Dom.recursiveQuerySelector(w.document, '[data-ca-profitx-pageid]');
            pageId = page ? Number(page.getAttribute('data-ca-profitx-pageid')) : pageId;
            firstPageIdDetect = false;
          }
          config.vm.em.defaultGroup = String(pageId);
        }

        (<HTMLElement[]>Dom.recursiveQuerySelectorAll(w.document, `.${className}`)).forEach((element: HTMLElement) => {
          if (element.tagName === "SCRIPT") {
            const newEl = document.createElement("div");
            [].slice.call(element.attributes)
              .filter((attr: Attr) => attr.name !== "src")
              .forEach((attribute: Attr) => {
                newEl.setAttribute(attribute.name, attribute.value);
              });
            element.parentElement.insertBefore(newEl, element);
            element.parentElement.removeChild(element);
            element = newEl;
          }

          const spotId = element.getAttribute("data-ca-profitx-spotid");
          const tagId = element.getAttribute("data-ca-profitx-tagid");
          if (spotId && oldconfigs.filter(config => config.spotId === spotId)[0]) {
            const oldconfig = oldconfigs.filter(config => config.spotId === spotId)[0];
            if (oldconfig) {
              upgradeElement(element, config, oldconfig, existsPageId);
            }
          } else if (tagId && oldconfigs.filter(config => config.tagId === tagId)[0]) {
            const oldconfig = oldconfigs.filter(config => config.tagId === tagId)[0];
            if (oldconfig) {
              upgradeElement(element, config, oldconfig, existsPageId);
            }
          }
        });
        oldconfigs.forEach(oldconfig => upgradeConfig(config, oldconfig));
      });
    }
    function upgradeConfig(config: Configuration, oldconfig: OldConfiguration): void {
      const name = oldconfig.tagId;
      const qualifier = oldconfig.spotId;
      if (!config.vm.em.hasOption(name)) {
        const emoption = config.vm.em.options[name] = new ElementOption(name);
        emoption.expandedClickParams = oldconfig.expandedClickParams;
        emoption.notrim = oldconfig.notrim;
        emoption.preRender = oldconfig.preRender;
        if (oldconfig.priority !== void 0) {
          emoption.multiple.enabled = true;
          emoption.multiple.sizeHint = oldconfig.priority;
        }
        emoption.format = oldconfig.adFormat;
        if (emoption.isBanner()) {
          emoption.renderer.injectMethod = "iframe";
        }
        emoption.assets = (oldconfig.assets || []).map(asset => {
          return new AssetOption(getAssetIdByName(asset.name), asset.prop);
        });
      } else {
        const emoption = config.vm.em.option(name);
        if (oldconfig.priority !== void 0) {
          emoption.multiple.enabled = true;
          emoption.multiple.sizeHint = Math.max(emoption.multiple.sizeHint, oldconfig.priority);
        }
      }
      let template: string = "";
      if (oldconfig.templateHtml) {
        template = oldconfig.templateHtml;
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
      _oldconfigs.push(oldconfig);
    }
    function upgradeTemplate(template: string = "", config: Configuration): string {
      template = template.replace(/data-pfx-link-self/g, `${config.vm.em.renderer.link.anchorTargetAttrName}="_self"`);
      template = template.replace(/data-pfx-link-top/g, `${config.vm.em.renderer.link.anchorTargetAttrName}="_top"`);
      template = template.replace(/data-pfx-link-blank/g, `${config.vm.em.renderer.link.anchorTargetAttrName}="_blank"`);
      template = template.replace(/data-pfx-link-parent/g, `${config.vm.em.renderer.link.anchorTargetAttrName}="_parent"`);
      return template;
    }
    function upgradeElement(element: HTMLElement, config: Configuration, oldconfig: OldConfiguration, existsPageId: boolean): void {
      const name = oldconfig.tagId;
      element.setAttribute(config.vm.em.nameAttributeName, name);
      const qualifier = oldconfig.spotId;
      if (qualifier) {
        element.setAttribute(config.vm.em.qualifierAttributeName, qualifier);
      }
      if (oldconfig.templateId) {
        element.setAttribute(config.vm.em.useTemplateNameAttr, oldconfig.templateId);
      }
      if (!element.getAttribute(config.vm.em.groupAttributeName)) {
        element.setAttribute(config.vm.em.groupAttributeName, existsPageId ? config.vm.em.defaultGroup : RandomId.gen());
      }
    }
    Adversatile.use({
      install: function(adv: any) {
        adv.plugin.bridge = adv.plugin.bridge || {};
        setInterval(() => {
          if (ProFitX.Global.ifa) {
            adv.bridge.ifa = ProFitX.Global.ifa;
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