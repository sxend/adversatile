import { OpenRTB } from "../openrtb/OpenRTB";
import { Dom } from "../misc/Dom";
import { RandomId } from "../misc/RandomId";
import Response = OpenRTB.NativeAd.Response;
import ResAssets = Response.Assets;
import { CookieUtils } from "../misc/CookieUtils";
import deepmerge from "deepmerge";
import { getOrElse } from "../misc/ObjectUtils";

export namespace OpenRTBUtils {
  export async function createImp(
    id: string,
    tagId: string,
    format: string,
    assets: OpenRTB.NativeAd.Request.Assets[],
    ext: OpenRTB.Ext.ImpressionExt
  ) {
    const imp = new OpenRTB.Imp();
    imp.id = id;
    imp.tagid = tagId;
    imp._native = format === "native" ? await createNative(assets) : void 0;
    imp.banner = format === "banner" ? await createBanner() : void 0;
    imp.ext = ext;
    return imp;
  }
  export async function createBidReqWithImp(
    imp: OpenRTB.Imp[],
    ext: OpenRTB.Ext.BidRequestExt,
    ifa?: string
  ): Promise<OpenRTB.BidRequest> {
    const wdw = await Dom.TopLevelWindow;
    const siteLocation = wdw.location;
    const siteDocument = wdw.document;
    const site = new OpenRTB.Site();
    (site.page = siteLocation.href),
      (site.domain = siteLocation.hostname),
      (site.ref = !!siteDocument ? siteDocument.referrer : void 0);
    let device: OpenRTB.Device;
    if (ifa) {
      device = new OpenRTB.Device();
      device.ifa = ifa;
    } else {
      device = JSON.parse(CookieUtils.getItem("pfx_req_device") || "{}");
    }
    const req = new OpenRTB.BidRequest();
    req.id = RandomId.gen("rtb");
    req.imp = imp;
    req.site = site;
    req.device = device;
    req.app = JSON.parse(CookieUtils.getItem("pfx_req_app") || "{}");
    req.ext = deepmerge(JSON.parse(CookieUtils.getItem("pfx_req_ext") || "{}"), ext);
    return req;
  }
  export async function createNative(
    assets: OpenRTB.NativeAd.Request.Assets[]
  ): Promise<OpenRTB.Native> {
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
  export function getIfa(ifaAttrName?: string): string {
    if (ifaAttrName) {
      const element = <Element>Dom.recursiveQuerySelector(document, `[${ifaAttrName}]`);
      if (element && element.getAttribute(ifaAttrName)) {
        return element.getAttribute(ifaAttrName);
      }
    }
    const Adversatile = (<any>window).Adversatile;
    return getOrElse(() => Adversatile.bridge.ifa);
  }

  export const dummyImg: string = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  export const dummyText: string = "...";
  export const DUMMY_BID_ID = "DUMMY";
  export function dummyBid(): OpenRTB.Bid {
    const bid = new OpenRTB.Bid();
    bid.id = DUMMY_BID_ID;
    bid.ext.admNative.assets = [
      new ResAssets(1, false, new Response.Img(dummyImg), null, null, null, null),
      new ResAssets(2, false, new Response.Img(dummyImg), null, null, null, null),
      new ResAssets(3, false, null, null, new Response.Title(dummyText), null, null),
      new ResAssets(4, false, null, null, new Response.Title(dummyText), null, null),
      new ResAssets(5, false, null, null, new Response.Title(dummyText), null, null),
      new ResAssets(7, false, new Response.Img(dummyImg), new Response.Link(""), null, null, null),
      new ResAssets(8, false, null, new Response.Link(""), null, null, null),
      new ResAssets(9, false, null, null, new Response.Title(dummyText), null, null),
      new ResAssets(10, false, null, null, new Response.Title(dummyText), null, null),
    ];
    bid.ext.admNative.link = new Response.Link("", []);
    return bid;
  };
  export function isDummyBid(bid: OpenRTB.Bid): boolean {
    return bid.id === DUMMY_BID_ID;
  }
  export function concatImpTrackers(bid: OpenRTB.Bid): string[] {
    let imptrackers: string[] = [];
    if (!!bid.ext && !!bid.ext.imptrackers) {
      imptrackers = imptrackers.concat(bid.ext.imptrackers);
    }
    if (!!bid.ext && !!bid.ext.admNative && !!bid.ext.admNative.imptracker) {
      imptrackers = imptrackers.concat(bid.ext.admNative.imptracker);
    }
    return imptrackers
  }
  export function concatVimpTrackers(bid: OpenRTB.Bid): string[] {
    let vimpTrackers: string[] = [];
    if (!!bid && !!bid.ext && !!bid.ext.viewableImptrackers) {
      vimpTrackers = vimpTrackers.concat(bid.ext.viewableImptrackers);
    }
    if (!!bid && !!bid.ext && !!bid.ext.admNative && !!bid.ext.admNative.ext && !!bid.ext.admNative.ext.viewableImptrackers) {
      vimpTrackers = vimpTrackers.concat(bid.ext.admNative.ext.viewableImptrackers);
    }
    return vimpTrackers;
  }
  export function concatViewThroughTrackers(bid: OpenRTB.Bid): string[] {
    let viewThroughUrls: string[] = [];
    if (!!bid && !!bid.ext && !!bid.ext.viewThroughUrls) {
      viewThroughUrls = viewThroughUrls.concat(bid.ext.viewThroughUrls);
    }
    return viewThroughUrls;
  }
  export function setPatternToClickUrls(ext: OpenRTB.Ext.BidExt, pattern: OpenRTB.Ext.Adhoc.PagePattern) {
    const url = getOrElse(() => ext.admNative.link.url);
    if (url) {
      ext.admNative.link.url =
        appendPatternIdToUrl(url, pattern.id);
    }
  }
  export function setPatternToVimpTrackers(ext: OpenRTB.Ext.BidExt, pattern: OpenRTB.Ext.Adhoc.PagePattern) {
    let trackers = getOrElse(() => ext.viewableImptrackers);
    if (trackers) {
      for (let i in trackers) {
        ext.viewableImptrackers[i] =
          appendPatternIdToUrl(trackers[i], pattern.id);
      }
    }
    trackers = getOrElse(() => ext.admNative.ext.viewableImptrackers);
    if (trackers) {
      for (let i in trackers) {
        ext.admNative.ext.viewableImptrackers[i] =
          appendPatternIdToUrl(trackers[i], pattern.id);
      }
    }
  }
  function appendPatternIdToUrl(url: string, id: number): string {
    const delimiter = (url.indexOf("?") === -1) ? "?" : "&";
    return url + delimiter + "pattern=" + id;
  }
}