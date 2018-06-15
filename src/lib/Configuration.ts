import deepmerge from "deepmerge";

export default class Configuration {
  version: number;
  action: ActionConf = new ActionConf();
  store: StoreConf = new StoreConf();
  vm: ViewModelConf = new ViewModelConf();
}

export class ActionConf {
  apiUrl: string = "/* @echo API_URL */";
  jsonFetchPath: string = "/* @echo JSON_FETCH_PATH */" || "/demo/sample.json";
  jsonpFetchPath: string =
    "/* @echo JSONP_FETCH_PATH */" || "/demo/sample.jsonp";
}

export class StoreConf { }

export class ViewModelConf {
  selector: string = ".adversatile";
  markedClass: string = "adv-marked";
  deviceIfaAttrName: string = "data-adv-device-ifa";
  polling: PollingConf = new PollingConf();
  prefetch: PrefetchConf[] = [];
  em: ElementModelConf = new ElementModelConf();
}

export class PollingConf {
  interval: number = 100;
}

export class PrefetchConf {
  name: string;
  size: number;
}

export class ElementModelConf {
  nameAttributeName: string = "data-adv-em-name";
  qualifierAttributeName: string = "data-adv-em-qualifier";
  templateQualifierKey: string = "data-adv-em-template";
  options: { [name: string]: ElementOption } = {};
  hasOption: (name: string) => boolean = function(this: ElementModelConf, name) {
    return Object.keys(this.options).indexOf(name) !== -1;
  };
  option: (name: string) => ElementOption = function(this: ElementModelConf, name) {
    return deepmerge(new ElementOption(name), this.options[name] || {});
  };
  templates: { [name: string]: string } = {};
  macro: MacroConf = new MacroConf();
}

export class ElementOption {
  constructor(public name: string) { }
  preRender: boolean = true;
  format: string = "native";
  assets: AssetOption[] = [];
  notrim: boolean = false;
  excludedBidders: string[] = [];
  expandedClickParams: [{ name: string; value: string | number }] = <any>[];
  video: ElementVideoOption = new ElementVideoOption();
}
export class ElementVideoOption {
  autoReplay: boolean = true;
  replayDelayMillis: number = 3000;
}

export class AssetOption {
  constructor(public id: number, public prop: any = {}) { }
}

export class MacroConf {
  video: VideoMacroConf = new VideoMacroConf();
  markupVideo: MarkupVideoMacroConf = new MarkupVideoMacroConf();
  mainImage: MainImageMacroConf = new MainImageMacroConf();
  iconImage: IconImageMacroConf = new IconImageMacroConf();
  optoutLink: OptoutLinkMacroConf = new OptoutLinkMacroConf();
  optoutLinkOnly: OptoutLinkOnlyMacroConf = new OptoutLinkOnlyMacroConf();
  sponsoredByMessage: SponsoredByMessageMacroConf = new SponsoredByMessageMacroConf();
  titleLong: TitleLongMacroConf = new TitleLongMacroConf();
  titleShort: TitleShortMacroConf = new TitleShortMacroConf();
  link: LinkMacroConf = new LinkMacroConf();
  linkJs: LinkJsMacroConf = new LinkJsMacroConf();
}
export class VideoMacroConf {
  selectorAttrName: string = "data-adv-macro-video";
  videoPlayerScriptUrl: string = "/* @echo VIDEO_PLAYER_SCRIPT_URI */" || "";
  videoPlayerObjectName: string = "/* @echo VIDEO_PLAYER_OBJECT_NAME */" || "";
}
export class MarkupVideoMacroConf {
  selectorAttrName: string = "data-adv-macro-img";
  markedId: string = "adv-markup-video";
}
export class MainImageMacroConf {
  selectorAttrName: string = "data-adv-macro-img";
}
export class IconImageMacroConf {
  selectorAttrName: string = "data-adv-macro-icon";
}
export class OptoutLinkMacroConf {
  selectorAttrName: string = "data-adv-macro-optout-link";
  markedClass: string = "adv-optout-image";
}
export class OptoutLinkOnlyMacroConf {
  selectorAttrName: string = "data-adv-macro-optout-link-only";
  markedClass: string = "adv-optout-link-only-added";
  anchorTargetAttrName: string = "data-adv-anchor-target";
}
export class TitleLongMacroConf {
  selectorAttrName: string = "data-adv-macro-title-long";
}
export class TitleShortMacroConf {
  selectorAttrName: string = "data-adv-macro-title-short";
}
export class SponsoredByMessageMacroConf {
  selectorAttrName: string = "data-adv-macro-sponsored-by-message";
}
export class LinkMacroConf {
  selectorAttrName: string = "data-adv-macro-link";
  markedClass: string = "adv-link-added";
  urlPlaceholder: string = "adv-url";
  encodedUrlPlaceholder: string = "adv-encoded-url";
  anchorMarkedClass: string = "adv-anchor-link";
  anchorTargetAttrName: string = "data-adv-anchor-target";
}
export class LinkJsMacroConf {
  selectorAttrName: string = "data-adv-macro-link-js";
  openTargetAttrName: string = "data-adv-open-target";
}

export function isConfiguration(obj: any): boolean {
  return !!obj && obj.version !== void 0;
}

export function asConfituration(obj: any): Configuration {
  const configuration = deepmerge(new Configuration(), obj || {});
  return configuration;
}
