import { ViewModel } from "./ViewModel";
const deepmerge = require("deepmerge").default;

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
  templateQualifierKey: string = "data-adv-em-template";
  options: { [name: string]: ElementOption } = {};
  hasOption: (name: string) => boolean = function(name) {
    return Object.keys(this.options).indexOf(name) !== -1;
  };
  option: (name: string) => ElementOption = function(name) {
    return deepmerge(new ElementOption(name), this.options[name] || {});
  };
  templates: { [name: string]: string } = {};
  macro: MacroConf = new MacroConf();
}

export class ElementOption {
  constructor(public name: string) { }
  preRender: boolean = true;
  format: string = "native";
  assets: AssetOption[] = []; // FIXME use official asset
  notrim: boolean = false;
  excludedBidders: string[] = [];
}

export class AssetOption {
  constructor(public id: number, public name?: string, public prop: any = {}) { }
}

export class MacroConf {
  video: VideoMacroConf = new VideoMacroConf();
  markupVideo: MarkupVideoMacroConf = new MarkupVideoMacroConf();
  optoutLinkMacro: OptoutLinkMacroConf = new OptoutLinkMacroConf();
  optoutLinkOnlyMacro: OptoutLinkOnlyMacroConf = new OptoutLinkOnlyMacroConf();
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
export class OptoutLinkMacroConf {
  selectorAttrName: string = "data-adv-macro-optout-link";
  markedClass: string = "adv-optout-image";
}
export class OptoutLinkOnlyMacroConf {
  selectorAttrName: string = "data-adv-macro-optout-link-only";
  markedClass: string = "adv-optout-link-only-added";
  anchorTargetAttrName: string = "data-adv-anchor-target";
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
