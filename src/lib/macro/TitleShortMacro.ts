import { Macro, MacroProps } from "../MacroOps";
import { MacroConf, AssetOption } from "../Configuration";
import { MacroUtils } from "./MacroUtils";
import { nano } from "../misc/StringUtils";
import { Dom } from "../misc/Dom";
import { AssetUtils } from "../openrtb/OpenRTBUtils";
import { OpenRTB } from "../openrtb/OpenRTB";
import AssetTypes = OpenRTB.NativeAd.AssetTypes;
import ResAssets = OpenRTB.NativeAd.Response.Assets;

export class TitleShortMacro implements Macro {
  constructor(private config: MacroConf, private props: MacroProps) { }
  getName(): string {
    return "TitleShortMacro";
  }
  async applyMacro(element: HTMLElement, context: any): Promise<void> {
    const titleId = AssetUtils.getAssetIdByAsset(AssetTypes.TITLE_SHORT);
    const assets: ResAssets[] = context.bid.ext.admNative.assets;
    const title = assets.find(asset => asset.id === titleId);
    if (!title) return;
    const targets: HTMLElement[] = [].slice.call(
      element.querySelectorAll(this.selector())
    );
    if (targets.length === 0) return Promise.resolve();
    for (let target of targets) {
      MacroUtils.insertTextAsset(target, title.title.text);
      if (this.props.addAssetOptions) {
        this.props.addAssetOptions(AssetUtils.titleTextOption());
      }
    }
    return Promise.resolve();
  }
  private selector(): string {
    return `[${this.config.titleShort.selectorAttrName}]`;
  }
}
