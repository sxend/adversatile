import { MacroConf, AssetOption } from "./Configuration";
import { LinkMacro } from "./macro/LinkMacro";
import { LinkJsMacro } from "./macro/LinkJsMacro";
import { VideoMacro } from "./macro/VideoMacro";
import { MarkupVideoMacro } from "./macro/MarkupVideoMacro";
import { MainImageMacro } from "./macro/MainImageMacro";
import { IconImageMacro } from "./macro/IconImageMacro";
import { OptoutLinkMacro } from "./macro/OptoutLinkMacro";
import { OptoutLinkOnlyMacro } from "./macro/OptoutLinkOnlyMacro";
import { SponsoredByMessageMacro } from "./macro/SponsoredByMessageMacro";
import { TitleLongMacro } from "./macro/TitleLongMacro";
import { TitleShortMacro } from "./macro/TitleShortMacro";
import { OpenRTB } from "./openrtb/OpenRTB";
import { getOrElse } from "./misc/ObjectUtils";
import { ElementModel } from "./ElementModel";
import { NanoTemplateMacro } from "./macro/NanoTemplateMacro";
import { InjectMacro } from "./macro/InjectMacro";

export class MacroOps {
  constructor(private config: MacroConf) {
    config.plugins.forEach(plugin => plugin.install(this));
  }
  async applyMacro(context: MacroContext): Promise<void> {
    for (let macro of this.macroStack(context.props)) {
      context = await macro.applyMacro(context);
      context.metadata.appliedMacroNames.push(macro.getName());
    }
  }
  private macroStack(props: MacroProps): Macro[] {
    return [
      new NanoTemplateMacro(),
      new InjectMacro(this.config),
      new VideoMacro(this.config, props),
      new MarkupVideoMacro(this.config),
      new MainImageMacro(this.config, props),
      new IconImageMacro(this.config, props),
      new OptoutLinkMacro(this.config),
      new OptoutLinkOnlyMacro(this.config),
      new SponsoredByMessageMacro(this.config, props),
      new TitleLongMacro(this.config, props),
      new TitleShortMacro(this.config, props),
      new LinkJsMacro(this.config),
      new LinkMacro(this.config, props)
    ];
  }
}

export interface Macro {
  getName(): string;
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
    public bid: OpenRTB.Bid,
  ) {
    this.assets = getOrElse(() => bid.ext.admNative.assets, []);
    this.admNative = getOrElse(() => bid.ext.admNative);
    this.metadata = new MacroMetadata();
  }
}
class MacroMetadata {
  public appliedMacroNames: string[] = [];
}