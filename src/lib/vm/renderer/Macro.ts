import { MacroConf, AssetOption } from "../../Configuration";
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
import { NanoTemplateMacro } from "./macro/NanoTemplateMacro";
import { InjectMacro } from "./macro/InjectMacro";
import { OpenRTB } from "../../openrtb/OpenRTB";
import { ElementModel } from "../ElementModel";
import { getOrElse, LockableFunction } from "../../misc/ObjectUtils";
import { BannerAdMacro } from "./macro/BannerAdMacro";

export class MacroOps {
  constructor(private config: MacroConf) {
    config.plugins.forEach(plugin => plugin.install(this));
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    return this.construct(context.props)(context);
  }
  private construct(
    props: MacroProps
  ): (context: MacroContext) => Promise<MacroContext> {
    const macros: Macro[] = [
      new BannerAdMacro(this.config),
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
    return async (context: MacroContext) => {
      for (let macro of macros) {
        context = await macro.applyMacro(context);
        context.metadata.appliedMacroNames.push(macro.getName());
      }
      return context;
    }
  }
}

export interface Macro {
  applyMacro(context: MacroContext): Promise<MacroContext>;
  getName(): string;
}

export interface MacroProps {
  impress: (bid: OpenRTB.Bid) => void;
  vimp: LockableFunction<OpenRTB.Bid>;
  viewThrough: (bid: OpenRTB.Bid) => void;
  findAssets: (...option: AssetOption[]) => void;
  onClickForSDKBridge?: (url: string, appId?: string) => void;
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
