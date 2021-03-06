import Configuration, { ElementOption, AssetOption } from "../lib/Configuration";
import { OpenRTB } from "../lib/openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import { OpenRTBUtils } from "../lib/openrtb/OpenRTBUtils";
import { Dom } from "../lib/misc/Dom";
import Analytics from "../lib/misc/Analytics";
import { ElementModel, UpdateContext } from "../lib/vm/ElementModel";
import { getOrElse, assign, onceFunction, entries, firstDefined, groupBy } from "../lib/misc/ObjectUtils";
import { AssetUtils } from "../lib/openrtb/AssetUtils";
import { Renderer, RendererContext } from "../lib/vm/Renderer";
import { RandomId } from "../lib/misc/RandomId";
import { NanoTemplateRenderer } from "../lib/vm/renderer/NanoTemplateRenderer";
import deepmerge from "deepmerge";
import { isDefined, isEmptyArray } from "../lib/misc/TypeCheck";
import { ViewableObserver } from "../lib/misc/ViewableObserver";
import { InjectRenderer } from "../lib/vm/renderer/InjectRenderer";
import { LinkRenderer } from "../lib/vm/renderer/LinkRenderer";
import { Async } from "../lib/misc/Async";
import { Backend } from "../lib/action/Backend";

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
  pfxbridge: any,
  advNativeBridge: any
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
    const config = new Configuration();
    config.version = 1;
    config.vm.deviceIfaAttrName = "data-ca-profitx-device-ifa";
    config.action.backend.adcallCallbackPrefix = "pfxCallback_";
    config.vm.em.groupAttributeName = 'data-ca-profitx-pageid';
    const runMain = onceFunction(() => {
      setTimeout(() => {
        Adversatile.main(config).catch(console.error)
      }, 500); // wait for other setup method call
    });
    const oldcontext: {
      config: Configuration
      oldconfigs: OldConfiguration[]
      assets: OpenRTB.NativeAd.Request.Assets[][]
    } = <any>{
      oldconfigs: []
    };
    function init(_names: any[], _assets?: OpenRTB.NativeAd.Request.Assets[][]) {
      console.log("adv init");
    };
    function render(oldconfig: OldConfiguration) {
      console.log("adv render");
      if (isDefined(oldconfig.elementClass)) {
        Dom.recursiveQuerySelectorAll(document.body, `.${oldconfig.elementClass}`).forEach((element: HTMLElement) => {
          upgradeElement(element, config, oldconfig, false);
        });
      }
      setup(oldconfig.elementClass || "ca_profitx_ad", [oldconfig]);
      runMain(null);
    }
    function preRender() {
      console.log("adv preRender");
    }
    // override impid: "1"
    config.action.backend.plugins.push({
      install: function(backend: Backend) {
        const original = backend.adcall;
        backend.adcall = async function(req: OpenRTB.BidRequest) {
          const response: OpenRTB.BidResponse = await original.call(backend, req);
          const sbid = getOrElse(() => response.seatbid[0]);
          if (!isDefined(sbid) || !isDefined(sbid.bid) || isEmptyArray(sbid.bid)) return response;
          const group = groupBy(sbid.bid, bid => bid.ext.tagid);
          Object.keys(group).forEach(tagId => {
            const imps = req.imp.filter(imp => imp.tagid === tagId);
            const defaultImp = imps[0];
            if (!defaultImp) return;
            group[tagId].forEach((bid: OpenRTB.Bid) => {
              const imp = imps.shift() || defaultImp;
              bid.impid = imp.id;
            });
          });
          return response;
        }
      }
    });
    // update default group by newest group
    config.vm.em.plugins.push({
      install: function(model: ElementModel) {
        if (model.group) {
          config.vm.em.defaultGroup = model.group;
        }
      }
    });
    config.vm.em.plugins.push({
      // bind callbacks
      install: function(model: ElementModel) {
        try {
          model.on("render", function render(context: RendererContext) {
            if (OpenRTBUtils.isDummyBid(context.bid)) return;
            const oldconfig = oldcontext.oldconfigs.find(x => x.tagId === context.bid.ext.tagid);
            if (oldconfig && oldconfig.onpfxadrender) {
              oldconfig.onpfxadrender(context.bid, null);
            }
            if (window.onpfxadload) {
              window.onpfxadload([context.bid.ext], context.parentSeatBid);
            }
          });
          model.on("rendered", function rendered(context: RendererContext) {
            if (OpenRTBUtils.isDummyBid(context.bid)) return;
            const oldconfig = oldcontext.oldconfigs.find(x => x.tagId === context.bid.ext.tagid);
            if (oldconfig && oldconfig.onpfxadrendered) {
              oldconfig.onpfxadrendered(context.bid, null, context.element.target);
            }
            if (window.onpfxadrendered) {
              window.onpfxadrendered(context.element.model.qualifier);
            }
          });
          model.on("viewable_impression", (context: RendererContext) => {
            const oldconfig = oldcontext.oldconfigs.find(x => x.tagId === context.bid.ext.tagid);
            if (oldconfig && oldconfig.onpfxadinview) {
              oldconfig.onpfxadinview();
            }
          });
        } catch (e) {
          console.error(e);
        }
      }
    });
    config.vm.em.plugins.push({
      // display 0 pattern parentElement inview detection 
      install: function(model: ElementModel) {
        const oldconfig = oldcontext.oldconfigs.find(x => x.tagId === model.name);
        const original = model.update;
        model.update = function update(context: UpdateContext): Promise<void> {
          const size = getOrElse(() => context.dynamic.override.plcmtcnt);
          if (size === 0) {
            let target = Dom.isInIframe(<any>window) ? (<any>window).frameElement : model.element.parentNode;
            if (oldconfig.displayAreaParentNode) {
              target = <HTMLElement>oldconfig.displayAreaParentNode(context.dynamic.pattern, context.dynamic.override, {});
            }
            ViewableObserver.onceInview(target, () => {
              Analytics("send", {
                "dimension:page_histories": [
                  { "dimension:inview": 1 }
                ]
              });
            });
          }
          return original.call(model, context);
        };
      }
    });
    config.vm.em.renderer.plugins.push({
      install: function(renderer: Renderer) {
        if (renderer.getName() !== NanoTemplateRenderer.NAME) return;
        const original = renderer.render;
        renderer.render = function(context: RendererContext) {
          try {
            let html = getOrElse(() => context.bid.ext.bannerHtml);
            if (html) {
              const replacements: any = {
                "${PFX_AD_SCALE_RATIO}": "{{element.option.renderer.adScaleRatio}}",
                "${PFX_VIEWPORT_WIDTH}": "{{element.option.renderer.viewPortWidth}}"
              };
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

    // ydn noad callback
    config.vm.em.renderer.plugins.push({
      install: function(renderer: Renderer) {
        if (renderer.getName() !== NanoTemplateRenderer.NAME) return;
        const original = renderer.render;
        renderer.render = async function(context: RendererContext) {
          if (!context.bannerHtml) return original.call(renderer, context);
          const bidderName = getOrElse(() => context.bid.ext.bidderName, "");
          if (bidderName === "ydn") {
            context.element.option.banner.impSelector = "a,iframe[src*='yimg'],iframe[src*='yahoo'],iframe[src*='ydn']";
            const replacements: { [key: string]: string } = {};
            const noAdCallbackId: string = Dom.setGlobalCallback(
              RandomId.gen("__ydn_noad_cb"), () => {
                context.element.option.excludedBidders.push("ydn");
                context.element.model.emit("update_request", context.element.option);
              });
            replacements["${PFX_YDN_NOADCALLBACK}"] = [
              '<scr' + 'ipt>',
              `yads_noad_callback = 'parent.${noAdCallbackId}';`,
              '</sc' + 'ript>'
            ].join('\n');
            const pattern = /\$\{[A-Z_]+\}/ig;
            context.bid.ext.bannerHtml = context.bannerHtml.replace(pattern, matched => {
              return replacements[matched] || "";
            });
          }

          return original.call(renderer, context);
        };
      }
    });
    // browser integrated banner impression selector
    config.vm.em.renderer.plugins.push({
      install: function(renderer: Renderer) {
        if (renderer.getName() !== InjectRenderer.NAME) return;
        const original = renderer.render;
        renderer.render = async function(context: RendererContext) {
          const bidderName = getOrElse(() => context.bid.ext.bidderName, "");
          if (bidderName === "zucks") {
            context.element.option.banner.impSelector = "[id^=zucksad] > div > a";
          } else if (bidderName === "genius") {
            context.element.option.banner.impSelector = "a[href*='amoad.com%2Fclick']";
          } else if (bidderName === "afio") {
            context.element.option.banner.impSelector = "a[href*='amoad.com%2Fclick']";
          } else if (bidderName === "ydn") {
            context.element.option.banner.impSelector = "a,iframe[src*='yimg'],iframe[src*='yahoo'],iframe[src*='ydn']";
          }
          return original.call(renderer, context);
        };
      }
    });
    // active overlay
    config.vm.em.renderer.plugins.push({
      install: function(renderer: Renderer) {
        if (renderer.getName() !== InjectRenderer.NAME) return;
        const original = renderer.render;
        renderer.render = async function(context: RendererContext) {
          const target = context.element.target;
          context = await original.call(renderer, context);
          const oldconfig = oldcontext.oldconfigs.find(x => x.tagId === context.element.model.name);
          if (!oldconfig) return context;
          if (oldconfig.activeOverlaySetting && oldconfig.activeOverlaySetting.enabled) {
            const adInIframe = !!(await Dom.getOwnerIFrame(await Dom.TopLevelWindow, target));
            const width = context.bid.w;
            const height = context.bid.h;
            if (adInIframe) {
              enableActiveOverlay(oldconfig.tagId, oldconfig.activeOverlaySetting,
                <HTMLElement>(<any>window).frameElement, width, height); // decorate iframe element
            } else {
              enableActiveOverlay(oldconfig.tagId, oldconfig.activeOverlaySetting,
                target, width, height);
            }
          }
          return context;
        };
      }
    });

    // browser integrated banner link replace
    config.vm.em.renderer.plugins.push({
      install: function(renderer: Renderer) {
        if (renderer.getName() !== LinkRenderer.NAME) return;
        const original = renderer.render;
        renderer.render = async function(context: RendererContext) {
          context = await original.call(renderer, context);
          const bidderName = getOrElse(() => context.bid.ext.bidderName, "");
          let demandAnchorSelector: string;
          if (bidderName === "zucks") {
            demandAnchorSelector = "[id^=zucksad] > div > a";
          } else if (bidderName === "genius") {
            demandAnchorSelector = "a[href*='amoad.com%2Fclick']";
          } else if (bidderName === "afio") {
            demandAnchorSelector = "a[href*='amoad.com%2Fclick']";
          }
          if (!isDefined(demandAnchorSelector)) {
            return context;
          }
          const findLink: () => HTMLAnchorElement = () => <HTMLAnchorElement>Dom.recursiveQuerySelector(
            context.element.target,
            demandAnchorSelector);
          const link = await Async.waitAndGet(() => findLink(), 10, 3000);
          if (!link) {
            return context;
          }
          if (link.href.indexOf('ad.caprofitx.adtdp.com') === -1) {
            link.href = context.bid.ext.clickThroughUrl + encodeURIComponent(link.href);
          }
          if (context.metadata.isAppied(LinkRenderer.NAME)) {
            const targets: HTMLAnchorElement[] = context.metadata.getAttachment(LinkRenderer.NAME) || [];
            for (let target of targets) {
              target.href = link.href;
              target.addEventListener("click", () => link.click());
            }
          }
          return context;
        };
      }
    });
    config.vm.em.renderer.plugins.push({
      install: function(renderer: Renderer) {
        if (renderer.getName() !== NanoTemplateRenderer.NAME) return;
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
    let firstPageIdDetect = true;
    function setup(className: string, oldconfigs: OldConfiguration[], pageId?: number) {
      console.log("adv setup");
      runMain(null);
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
          const oldconfig = firstDefined([
            oldconfigs.filter(config => config.spotId === spotId)[0],
            oldconfigs.filter(config => config.tagId === tagId)[0]
          ]);
          if (oldconfig) {
            upgradeElement(element, config, oldconfig, existsPageId);
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
        if (oldconfig.priority > 1) {
          emoption.placement.size = oldconfig.priority;
        }
        emoption.placement.useTemplateNames.push(qualifier || name);
        if (isDefined(oldconfig.templateHtmlsByPattern)) {
          entries(oldconfig.templateHtmlsByPattern).forEach(entry => {
            const dynamicTemplateId = RandomId.gen("tmpl");
            emoption.dynamic.useTemplateNamesByPattern[entry[0]] = [dynamicTemplateId];
            config.vm.em.templates[dynamicTemplateId] = entry[1];
          });
        }
        if (isDefined(oldconfig.adFormat)) {
          emoption.format = oldconfig.adFormat;
        }
        if (emoption.isBanner()) {
          emoption.banner.impSelector = 'a[href*="ad.caprofitx.adtdp.com"],img[src]';
          emoption.renderer.injectMethod = "iframe";
        }
        emoption.assets = (oldconfig.assets || []).map(asset => {
          return new AssetOption(getAssetIdByName(asset.name), asset.prop);
        });
        if (oldconfig.videoSetting) {
          emoption.video = deepmerge(emoption.video, oldconfig.videoSetting);
          emoption.loop.enabled = true;
          emoption.loop.limitCount = oldconfig.maxVideoPlayTotalNth / emoption.video.playLimitCount;
        }
        if (isDefined(oldconfig.sdkIntegrationSetting) && oldconfig.sdkIntegrationSetting.enabled) {
          (<any>window).enableSDK = true;
          window.advNativeBridge = window.pfxbridge;
        }
      } else {
        const emoption = config.vm.em.option(name);
        if (oldconfig.priority > 1) {
          emoption.placement.size = Math.max(emoption.placement.size, oldconfig.priority);
          emoption.placement.useTemplateNames.push(qualifier || name);
        }
      }
      let template: string = "";
      if (oldconfig.templateHtml) {
        template = oldconfig.templateHtml;
      }
      template = upgradeTemplate(template, config);
      if (template && template.length > 15) {
        if (!config.vm.em.templates[name]) {
          config.vm.em.templates[name] = template;
        }
        if (qualifier) {
          config.vm.em.templates[qualifier] = template;
        }
      }
      oldcontext.oldconfigs.push(oldconfig);
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
      } else {
        config.vm.em.defaultGroup = element.getAttribute(config.vm.em.groupAttributeName);
      }
    }
    Adversatile.use({
      install: function(adv: any) {
        const setBridges = () => {
          if (window.pfxbridge && (<any>window).enableSDK) {
            window.advNativeBridge = window.pfxbridge;
          }
          if (ProFitX.Global.ifa) {
            adv.plugin.ifa = ProFitX.Global.ifa;
          }
        };
        setInterval(setBridges, 500);
        setBridges();
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

async function enableActiveOverlay(tagId: string, activeOverlaySetting: ActiveOverlaySetting, element: HTMLElement, width: number = 320, height: number = 50): Promise<HTMLElement> {
  const appearancePercentageFromBottom = activeOverlaySetting.appearancePercentageFromBottom !== void 0 ?
    activeOverlaySetting.appearancePercentageFromBottom : 20;
  const transitionSeconds = activeOverlaySetting.transitionSeconds !== void 0 ?
    activeOverlaySetting.transitionSeconds : 2;
  const initialOpacity = activeOverlaySetting.initialOpacity !== void 0 ?
    activeOverlaySetting.initialOpacity : 0.8;
  const scrollEndMillis = activeOverlaySetting.scrollEndMillis !== void 0 ?
    activeOverlaySetting.scrollEndMillis : 100;
  const zIndex = activeOverlaySetting.zIndex !== void 0 ?
    activeOverlaySetting.zIndex : 10;
  let iframeStyle = "";
  const enableExpandFullWidth = activeOverlaySetting.enableExpandFullWidth !== void 0 ?
    activeOverlaySetting.enableExpandFullWidth : false;
  const enableFixToTopAtScrollEnded = activeOverlaySetting.enableFixToTopAtScrollEnded !== void 0 ?
    activeOverlaySetting.enableFixToTopAtScrollEnded : true;
  let offsetLeft = width / 2;
  const topLevelWindow = await Dom.TopLevelWindow;
  if (enableExpandFullWidth) {
    const scaleRatio = width !== 0 ? topLevelWindow.innerWidth / width : 0;
    iframeStyle = iframeStyle + `
      transform: scale(${scaleRatio}, ${scaleRatio});
      -webkit-transform: scale(${scaleRatio}, ${scaleRatio});
    `;
    if (navigator.userAgent.indexOf("Android 4") >= 0) {
      width = topLevelWindow.innerWidth;
      offsetLeft = Math.ceil(width / 2 * scaleRatio);
    }
  }
  const styleTag = document.createElement('style');
  styleTag.innerHTML = generateOverlayAnimationCSS(tagId, transitionSeconds, appearancePercentageFromBottom,
    0, initialOpacity, width, height, zIndex, iframeStyle, offsetLeft);
  topLevelWindow.document.head.appendChild(styleTag);
  function startOverlayAnimation() {
    element.classList.add(`pfx_active_overlay_animate_${tagId}`);
    const scrollTop = topLevelWindow.document.body.scrollTop;
    const scrollHeight = topLevelWindow.document.body.scrollHeight;
    const nowScrollEnded = Math.abs((topLevelWindow.innerHeight + scrollTop) - scrollHeight) <= 1; // domの構造によって、一番下でも完全一致しないケースがあるため。
    if (nowScrollEnded && enableFixToTopAtScrollEnded) { // 最下部までスクロールいた場合、上部に固定する
      element.setAttribute("data-pfx-active-overlay-position", "top");
      element.querySelector('iframe').setAttribute("data-pfx-active-overlay-position", "top");
    } else {
      // 下部へ吸い付く
      element.setAttribute("data-pfx-active-overlay-position", "bottom");
      element.querySelector('iframe').setAttribute("data-pfx-active-overlay-position", "bottom");
    }
  }
  element.classList.add(`pfx_active_overlay_${tagId}`);
  Dom.onScroll(() => {
    element.classList.remove(`pfx_active_overlay_animate_${tagId}`);
  });
  Dom.onScrollEnd(scrollEndMillis, () => {
    startOverlayAnimation();
  });
  startOverlayAnimation();
  return element;
}
function generateOverlayAnimationCSS(tagId: string, duration: number, fromBottom: number,
  toBottom: number, fromOpacity: number, width: number, height: number, zIndex: number,
  iframeStyle: string, offsetLeft: number): string {
  return `
    .pfx_active_overlay_${tagId} {
      display: none;
      margin: 0 0;
      border: 0;
      z-index: ${zIndex};
      position: fixed;
      width: ${width}px;
      height: ${height}px;
    }
    .pfx_active_overlay_${tagId} iframe {
      width: ${width}px;
      height: ${height}px;
      ${iframeStyle}
    }
    .pfx_active_overlay_${tagId} iframe[data-pfx-active-overlay-position="top"] {
      transform-origin: 50% 0% 0px;
      -webkit-transform-origin: 50% 0% 0px;
    }
    .pfx_active_overlay_${tagId} iframe[data-pfx-active-overlay-position="bottom"] {
      transform-origin: 50% 100% 0px;
      -webkit-transform-origin: 50% 100% 0px;
    }
    .pfx_active_overlay_${tagId}[data-pfx-active-overlay-position="top"] {
      top: 0;
      bottom: "";
    }
    .pfx_active_overlay_${tagId}[data-pfx-active-overlay-position="bottom"] {
      top: "";
      bottom: 0;
    }
    .pfx_active_overlay_animate_${tagId} {
      display: inline;
      left: 50%;
      margin-left: -${offsetLeft}px !important;
      animation-duration: ${duration}s;
      animation-fill-mode: forwards;
      animation-name: pfx_active_overlay_animation_${tagId};
      -webkit-animation-duration: ${duration}s;
      -webkit-animation-fill-mode: forwards;
      -webkit-animation-name: pfx_active_overlay_animation_${tagId};
    }
    @-webkit-keyframes pfx_active_overlay_animation_${tagId} {
      0% {
        bottom: ${fromBottom}%;
        opacity: ${fromOpacity};
      }
      100% {
        bottom: ${toBottom}%;
        opacity: 1;
      }
    }
    @keyframes pfx_active_overlay_animation_${tagId} {
      from {
        bottom: ${fromBottom}%;
        opacity: ${fromOpacity};
      }
      to {
        bottom: ${toBottom}%;
        opacity: 1;
      }
    }
    `;
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
  expandedClickParams: { name: string; value: string | number }[];
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