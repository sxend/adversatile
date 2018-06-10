import { Macro, MacroProps } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import ResAssets = OpenRTB.NativeAd.Response.Assets;

export class TitleLongMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "TitleLongMacro";
  }
  async applyMacro(element: HTMLElement, context: any): Promise<void> {
    const textId = AssetUtils.getAssetIdByAsset(AssetTypes.DESCRIPTIVE_TEXT);
    const assets: ResAssets[] = context.bid.ext.admNative.assets;
    const text = assets.find(asset => asset.id === textId);
    if (!text) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      MacroUtils.insertTextAsset(target, text.title.text);
      if (this.props.addAssetOptions) {
        this.props.addAssetOptions(AssetUtils.descriptiveTextOption());
      }
    }
    return Promise.resolve();
  }
  private selector(): string {
    return `[${this.config.titleLong.selectorAttrName}]`;
  }
}
