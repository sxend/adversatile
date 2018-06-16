import { MacroConf } from "../../Configuration";
import { MacroContext, Macro, MacroProps } from "./Macro";
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

export class MacroOps {
  constructor(private config: MacroConf) {
    config.plugins.forEach(plugin => plugin.install(this));
  }
  async applyMacro(context: MacroContext): Promise<MacroContext> {
    return this.construct(context.props).applyMacro(context);
  }
  private construct(
    props: MacroProps
  ): Macro {
    const macros: Macro[] = [
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
    return macros.reduce((prev: Macro, next: Macro) => {
      return {
        async applyMacro(context: MacroContext): Promise<MacroContext> {
          return next.applyMacro(await prev.applyMacro(context))
        }
      };
    });
  }
}