import Configuration, { MacroConf, AssetOption } from "./Configuration";
import { nano } from "./misc/StringUtils";
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
import { EventEmitter } from "events";
import { OpenRTB } from "./openrtb/OpenRTB";
import { resultOrElse } from "./misc/ObjectUtils";
import { ElementModel } from "./ElementModel";

export class MacroOps {
  constructor(private config: MacroConf) { }
  async applyTemplate(template: string, context: MacroContext): Promise<string> {
    return nano(template, context);
  }
  async applyElement(
    element: HTMLElement,
    context: MacroContext
  ): Promise<void> {
    for (let macro of this.macroStack(context.props)) {
      await macro.applyMacro(element, context).catch(console.error);
      context.metadata.appliedMacroNames.push(macro.getName());
    }
  }
  private macroStack(props: MacroProps): Macro[] {
    return [
      new VideoMacro(this.config, props),
      new MarkupVideoMacro(this.config, props),
      new MainImageMacro(this.config, props),
      new IconImageMacro(this.config, props),
      new OptoutLinkMacro(this.config, props),
      new OptoutLinkOnlyMacro(this.config, props),
      new SponsoredByMessageMacro(this.config, props),
      new TitleLongMacro(this.config, props),
      new TitleShortMacro(this.config, props),
      new LinkJsMacro(this.config, props),
      new LinkMacro(this.config, props)
    ];
  }
}

export interface Macro {
  getName(): string;
  applyMacro(element: HTMLElement, context: MacroContext): Promise<void>;
}

export interface MacroProps {
  onClickForSDKBridge?: (url: string, appId?: string) => void;
  addAssetOptions?: (...option: AssetOption[]) => void;
}
export class MacroContext {
  public metadata: MacroMetadata;
  public assets: OpenRTB.NativeAd.Response.Assets[];
  public admNative: OpenRTB.NativeAd.AdResponse;
  constructor(
    public model: ElementModel,
    public props: MacroProps,
    public bid: OpenRTB.Bid,
  ) {
    this.assets = resultOrElse(() => bid.ext.admNative.assets, []);
    this.admNative = resultOrElse(() => bid.ext.admNative);
    this.metadata = new MacroMetadata();
  }
}
class MacroMetadata {
  public appliedMacroNames: string[] = [];
}