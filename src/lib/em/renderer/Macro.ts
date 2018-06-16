import { OpenRTB } from "../../openrtb/OpenRTB";
import { ElementModel } from "../../ElementModel";
import { AssetOption } from "../../Configuration";
import { getOrElse } from "../../misc/ObjectUtils";

export interface Macro {
  applyMacro(context: MacroContext): Promise<MacroContext>;
}
export interface MacroProps {
  impress: () => void;
  vimp: () => void;
  viewThrough: () => void;
  onClickForSDKBridge?: (url: string, appId?: string) => void;
  addAssetOptions?: (...option: AssetOption[]) => void;
}
export class MacroContext {
  public metadata: MacroMetadata;
  public assets: OpenRTB.NativeAd.Response.Assets[];
  public admNative: OpenRTB.NativeAd.AdResponse;
  constructor(
    public model: ElementModel,
    public element: HTMLElement,
    public props: MacroProps,
    public template: string,
    public bid: OpenRTB.Bid
  ) {
    this.assets = getOrElse(() => bid.ext.admNative.assets, []);
    this.admNative = getOrElse(() => bid.ext.admNative);
    this.metadata = new MacroMetadata();
  }
}
class MacroMetadata {
  public appliedMacroNames: string[] = [];
}
