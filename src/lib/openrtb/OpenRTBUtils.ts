import { OpenRTB } from "../openrtb/OpenRTB";
import { Dom } from "../misc/Dom";
import Adversatile from "../../Adversatile";
import { AssetOption } from "../Configuration";

export namespace OpenRTBUtils {
  export async function createImp(id: string, format: string, assets: OpenRTB.NativeAd.Request.Assets[], ext: OpenRTB.Ext.ImpressionExt) {
    const imp = new OpenRTB.Imp();
    imp.id = id;
    imp.tagid = id;
    imp._native = format === "native" ? await createNative(assets) : void 0;
    imp.banner = format === "banner" ? await createBanner() : void 0;
    imp.ext = ext;
    return imp;
  }
  export async function createBidReqWithImp(imp: OpenRTB.Imp[], ext: OpenRTB.Ext.BidRequestExt, ifa?: string): Promise<OpenRTB.BidRequest> {
    const wdw = await Dom.TopLevelWindow;
    const siteLocation = wdw.location;
    const siteDocument = wdw.document;
    const site = new OpenRTB.Site();
    site.page = siteLocation.href,
      site.domain = siteLocation.hostname,
      site.ref = !!siteDocument ? siteDocument.referrer : void 0
    const device = new OpenRTB.Device();
    device.ifa = ifa;
    const app = new OpenRTB.App();
    const req = new OpenRTB.BidRequest();
    req.id = "1";
    req.imp = imp;
    req.site = site;
    req.device = device;
    req.app = app;
    req.ext = ext;
    return req;
  }
  export async function createNative(assets: OpenRTB.NativeAd.Request.Assets[]): Promise<OpenRTB.Native> {
    const native = new OpenRTB.Native();
    native.request = new OpenRTB.NativeAd.AdRequest();
    native.request.ver = "1";
    native.request.assets = assets;
    return native;
  }
  export async function createBanner(): Promise<OpenRTB.Banner> {
    const banner = new OpenRTB.Banner();
    banner.topframe = (await Dom.TopLevelWindow) === window ? 1 : 0;
    return banner;
  }
  function assetIdToObject(num: number): OpenRTB.NativeAd.Request.Assets {
    const asset = new OpenRTB.NativeAd.Request.Assets();
    asset.id = num;
    return asset;
  }
  function getIfa(ifaAttrName?: string) {
    if (ifaAttrName) {
      const element = document.querySelector(
        `[${ifaAttrName}]`
      );
      if (element && element.getAttribute(ifaAttrName)) {
        return element.getAttribute(ifaAttrName);
      }
    }
    if (Adversatile.plugin.bridge && Adversatile.plugin.bridge.ifa) {
      return Adversatile.plugin.bridge.ifa; // use bridge plugin
    }
  }
  export function optionToNativeAsset(option: AssetOption): OpenRTB.NativeAd.Request.Assets | undefined {
    const asset = new OpenRTB.NativeAd.Request.Assets();
    if (option.id === 1 || option.name === "link") {
      asset.id = option.id;
    }
    return asset;
  }
}