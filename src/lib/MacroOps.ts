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
  constructor(
    private config: MacroConf,
    private props: {
      addAssetOptions: (...assets: AssetOption[]) => void
    }
  ) { }
  async applyTemplate(template: string, data: any): Promise<string> {
    return nano(template, data);
  }
  async applyElement(
    element: HTMLElement,
    data: any,
    props: {
      onImpression: () => void,
      onInview: () => void,
      onViewThrough: () => void,
      onClick: () => void,
      trackingCall: (urls: string[], trackingName: string) => Promise<void>;
    }
  ): Promise<void> {
    data.macros = data.macros || {};
    const appliedMacros: string[] = (data.macros.appliedMacros = []);
    for (let macro of this.macroStack(data, props)) {
      await macro.applyMacro(element, data).catch(console.error);
      appliedMacros.push(macro.getName());
    }
  }
  private macroStack(data: any, props: any): Macro[] {
    return [
      new VideoMacro(this.config, props),
      new MarkupVideoMacro(this.config, {}),
      new MainImageMacro(this.config, {}),
      new IconImageMacro(this.config, {}),
      new OptoutLinkMacro(this.config, {}),
      new OptoutLinkOnlyMacro(this.config, {}),
      new SponsoredByMessageMacro(this.config, {}),
      new TitleLongMacro(this.config, {}),
      new TitleShortMacro(this.config, {}),
      new LinkJsMacro(this.config, {
        addAssetOptions: this.props.addAssetOptions,
        trackingCall: props.trackingCall
      }),
      new LinkMacro(this.config, {
        addAssetOptions: this.props.addAssetOptions
      })
    ];
  }
}

export interface Macro {
  getName(): string;
  applyMacro(element: HTMLElement, data: any): Promise<void>;
}
