import { OpenRTB } from "./OpenRTB";
import Response = OpenRTB.NativeAd.Response;
import ResAssets = Response.Assets;
import { AssetOption } from "../Configuration";

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
  export function getAssetIdByAsset(asset: AssetTypes): number {
    return asset + 1;
  }
  export function optionToNativeAsset(
    option: AssetOption
  ): ReqAssets | undefined {
    const asset = new ReqAssets();
    if (option.id === getAssetIdByAsset(AssetTypes.ICON_URL)) {
      return iconImage(option.prop["w"], option.prop["h"]);
    }
    if (option.id === getAssetIdByAsset(AssetTypes.IMAGE_URL)) {
      return mainImage(option.prop["w"], option.prop["h"]);
    }
    if (option.id === getAssetIdByAsset(AssetTypes.TITLE_SHORT)) {
      return titleText(option.prop["len"]);
    }
    if (option.id === getAssetIdByAsset(AssetTypes.DESCRIPTIVE_TEXT)) {
      return descriptiveText(option.prop["len"]);
    }
    if (option.id === getAssetIdByAsset(AssetTypes.SPONSORED_BY_MESSAGE)) {
      return sponsoredByMessage(option.prop["len"]);
    }
    return asset;
  }
  const defaultTextLength = 17;
  const defaultDescriptionLength = 32;
  export function iconImageOption(widthMin: number, heightMin: number): AssetOption {
    return new AssetOption(getAssetIdByAsset(AssetTypes.ICON_URL), { w: widthMin, h: heightMin });
  }
  export function mainImageOption(widthMin: number, heightMin: number): AssetOption {
    return new AssetOption(getAssetIdByAsset(AssetTypes.IMAGE_URL), { w: widthMin, h: heightMin });
  }
  export function titleTextOption(length: number = defaultTextLength): AssetOption {
    return new AssetOption(getAssetIdByAsset(AssetTypes.TITLE_SHORT), { len: length });
  }
  export function descriptiveTextOption(length: number = defaultDescriptionLength): AssetOption {
    return new AssetOption(getAssetIdByAsset(AssetTypes.DESCRIPTIVE_TEXT), { len: length });
  }
  export function sponsoredByMessageOption(length?: number): AssetOption {
    return new AssetOption(getAssetIdByAsset(AssetTypes.SPONSORED_BY_MESSAGE), { len: length });
  }
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
  export function sponsoredByMessage(length?: number): ReqAssets {
    return data(
      getAssetIdByAsset(AssetTypes.SPONSORED_BY_MESSAGE),
      DataTypes.SPONSORED,
      length
    );
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
  function data(assetId: number, typeId: number, length?: number): ReqAssets {
    var asset = new ReqAssets(assetId, true);
    asset.data = new OpenRTB.NativeAd.Request.Data(typeId, length);
    return asset;
  }
  export function findAsset(assets: ResAssets[], assetType: AssetTypes): ResAssets | undefined {
    return assets.find(asset => asset.id === getAssetIdByAsset(assetType));
  }
}
