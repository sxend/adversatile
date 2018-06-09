import { NativeRequest, BidRequest } from "../../generated-src/protobuf/messages";
import { Dom } from "./misc/Dom";
import Adversatile from "../Adversatile";

export namespace OpenRTBUtils {
  export async function createImp(id: string, format: string, assets: number[]) {
    const imp = new BidRequest.Imp({
      id: id,
      tagid: id,
      native: format === "native" ? await createNative(assets) : void 0,
      banner: format !== "native" ? await createBanner() : void 0
    });
    return imp;
  }
  export async function createBidReqWithImp(imp: BidRequest.IImp[], ext: any, ifaAttrName?: string): Promise<BidRequest> {
    const wdw = await Dom.TopLevelWindow;
    const siteLocation = wdw.location;
    const siteDocument = wdw.document;
    const site = new BidRequest.Site({
      page: siteLocation.href,
      domain: siteLocation.hostname,
      ref: !!siteDocument ? siteDocument.referrer : void 0
    });
    const device = new BidRequest.Device({
      ifa: getIfa(ifaAttrName)
    });
    const app = new BidRequest.App({
    });
    const req = new BidRequest({
      id: "1",
      imp,
      site,
      device,
      app,
      ...<any>{ ext: ext }
    });
    return req;
  }
  export async function createNative(assets: number[]): Promise<BidRequest.Imp.INative> {
    return new BidRequest.Imp.Native({
      requestNative: new NativeRequest({
        ver: "1",
        assets: assets.map(assetIdToObject)
      })
    });
  }
  export async function createBanner(): Promise<BidRequest.Imp.IBanner> {
    return new BidRequest.Imp.Banner({
      topframe: (await Dom.TopLevelWindow) === window
    });
  }
  function assetIdToObject(num: number): NativeRequest.Asset {
    return new NativeRequest.Asset({
      id: num
    });
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
}