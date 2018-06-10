import Configuration, { MacroConf, AssetOption } from "./Configuration";
import { nano } from "./misc/StringUtils";
import { LinkMacro } from "./macro/LinkMacro";
import { LinkJsMacro } from "./macro/LinkJSMacro";
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

export class MacroOps {
  constructor(private config: MacroConf) { }
  async applyTemplate(template: string, context: any): Promise<string> {
    return nano(template, context);
  }
  async applyElement(
    element: HTMLElement,
    context: any,
    props: MacroProps
  ): Promise<void> {
    context.macro = {};
    context.macro.metadata = {};
    context.macro.metadata.appliedMacroNames = [];
    for (let macro of this.macroStack(props)) {
      await macro.applyMacro(element, context).catch(console.error);
      context.macro.metadata.appliedMacroNames.push(macro.getName());
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
  applyMacro(element: HTMLElement, context: any): Promise<void>;
}

export interface MacroProps {
  onImpression?: () => void;
  onInview?: () => void;
  onViewThrough?: () => void;
  onClick?: () => void;
  onClickForSDKBridge?: (url: string, appId?: string) => void;
  trackingCall?: (urls: string[], trackingName: string) => Promise<void>;
}
