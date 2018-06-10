import { OpenRTB } from "../openrtb/OpenRTB";
import { Dom } from "../misc/Dom";
import Adversatile from "../../Adversatile";
import { AssetOption } from "../Configuration";
import { RandomId } from "../misc/RandomId";

export namespace OpenRTBUtils {
  export async function createImp(
    id: string,
    format: string,
    assets: OpenRTB.NativeAd.Request.Assets[],
    ext: OpenRTB.Ext.ImpressionExt
  ) {
    const imp = new OpenRTB.Imp();
    imp.id = id;
    imp.tagid = id;
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
    const device = new OpenRTB.Device();
    device.ifa = ifa;
    const app = new OpenRTB.App();
    const req = new OpenRTB.BidRequest();
    req.id = RandomId.gen();
    req.imp = imp;
    req.site = site;
    req.device = device;
    req.app = app;
    req.ext = ext;
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
      const element = document.querySelector(`[${ifaAttrName}]`);
      if (element && element.getAttribute(ifaAttrName)) {
        return element.getAttribute(ifaAttrName);
      }
    }
    if (Adversatile.plugin.bridge && Adversatile.plugin.bridge.ifa) {
      return Adversatile.plugin.bridge.ifa; // use bridge plugin
    }
  }
}
export namespace AssetUtils {
  import AssetTypes = OpenRTB.NativeAd.AssetTypes;
  import ImgTypes = OpenRTB.NativeAd.Request.ImgTypes;
  import DataTypes = OpenRTB.NativeAd.Request.DataTypes;
  import ReqAssets = OpenRTB.NativeAd.Request.Assets;
  export const assetIdMap: { [id: number]: AssetTypes } = {
    1: AssetTypes.ICON_URL,
    2: AssetTypes.IMAGE_URL,
    3: AssetTypes.LEGACY_SPONSORED_BY_MESSAGE,
    4: AssetTypes.LEGACY_TITLE_LONG,
    5: AssetTypes.TITLE_SHORT,
    6: AssetTypes.LOGO_URL,
    7: AssetTypes.OPTOUT_IMG,
    8: AssetTypes.OPTOUT_LINK,
    9: AssetTypes.DESCRIPTIVE_TEXT,
    10: AssetTypes.SPONSORED_BY_MESSAGE,
    11: AssetTypes.MARKUP_VIDEO,
    12: AssetTypes.VIDEO
  };

  export function getAssetByAssetId(id: number): AssetTypes {
    return assetIdMap[id];
  }
  function getAssetIdByAsset(asset: AssetTypes): number {
    return asset + 1;
  }
  function getImageTypeByAsset(assetId: AssetTypes): number {
    switch (assetId) {
      case AssetTypes.ICON_URL:
        return ImgTypes.ICON;
      case AssetTypes.LOGO_URL:
        return ImgTypes.LOGO;
      case AssetTypes.IMAGE_URL:
        return ImgTypes.MAIN;
      default:
        return ImgTypes.ICON;
    }
  }
  export function optionToNativeAsset(
    option: AssetOption
  ): ReqAssets | undefined {
    const asset = new ReqAssets();
    if (option.name === "iconImage") {
      return iconImage(option.prop["w"], option.prop["h"]);
    }
    if (option.name === "mainImage") {
      return mainImage(option.prop["w"], option.prop["h"]);
    }
    if (option.name === "titleText") {
      return titleText(option.prop["len"]);
    }
    if (option.name === "descriptionText") {
      return descriptiveText(option.prop["len"]);
    }
    if (option.name === "sponsoredByMessage") {
      return sponsoredByMessage(option.prop["len"]);
    }
    return asset;
  }
  const defaultTextLength = 17;
  const defaultDescriptionLength = 32;
  export function iconImage(widthMin: number, heightMin: number) {
    return image(
      getAssetIdByAsset(AssetTypes.ICON_URL),
      ImgTypes.ICON,
      widthMin,
      heightMin
    );
  }
  export function mainImage(widthMin: number, heightMin: number) {
    return image(
      getAssetIdByAsset(AssetTypes.IMAGE_URL),
      ImgTypes.MAIN,
      widthMin,
      heightMin
    );
  }
  export function titleText(length: number = defaultTextLength) {
    return title(getAssetIdByAsset(AssetTypes.TITLE_SHORT), length);
  }
  export function descriptiveText(length: number = defaultDescriptionLength) {
    return data(
      getAssetIdByAsset(AssetTypes.DESCRIPTIVE_TEXT),
      DataTypes.DESC,
      length
    );
  }
  export function sponsoredByMessage(length?: number) {
    return data(
      getAssetIdByAsset(AssetTypes.SPONSORED_BY_MESSAGE),
      DataTypes.SPONSORED,
      length
    );
  }
  export function iconImageOption(widthMin: number, heightMin: number): AssetOption {
    return new AssetOption(getAssetIdByAsset(AssetTypes.ICON_URL), "iconImage", { w: widthMin, h: heightMin });
  }
  export function mainImageOption(widthMin: number, heightMin: number): AssetOption {
    return new AssetOption(getAssetIdByAsset(AssetTypes.IMAGE_URL), "mainImage", { w: widthMin, h: heightMin });
  }
  export function titleTextOption(length: number = defaultTextLength): AssetOption {
    return new AssetOption(getAssetIdByAsset(AssetTypes.TITLE_SHORT), "titleText", { len: length });
  }
  export function descriptiveTextOption(length: number = defaultDescriptionLength): AssetOption {
    return new AssetOption(getAssetIdByAsset(AssetTypes.DESCRIPTIVE_TEXT), "descriptionText", { len: length });
  }
  export function sponsoredByMessageOption(length?: number): AssetOption {
    return new AssetOption(getAssetIdByAsset(AssetTypes.SPONSORED_BY_MESSAGE), "iconImage", { len: length });
  }
  function title(
    assetId: number,
    textLength: number = defaultTextLength
  ): ReqAssets {
    var asset = new ReqAssets(assetId, true);
    asset.title = new OpenRTB.NativeAd.Request.Title(textLength);
    return asset;
  }
  function image(
    assetId: number,
    typeId: number,
    widthMin: number,
    heightMin: number
  ) {
    var asset = new ReqAssets(assetId, true);
    asset.img = new OpenRTB.NativeAd.Request.Img(
      typeId,
      undefined,
      undefined,
      widthMin,
      heightMin
    );
    return asset;
  }
  function data(assetId: number, typeId: number, length?: number) {
    var asset = new ReqAssets(assetId, true);
    asset.data = new OpenRTB.NativeAd.Request.Data(typeId, length);
    return asset;
  }
}
