import deepmerge from "deepmerge";
import { ElementModel } from "./vm/ElementModel";
import { ViewModel } from "./ViewModel";
import { assign } from "./misc/ObjectUtils";
import { ElementGroup } from "./vm/ElementGroup";
import { Backend } from "./action/Backend";
import { Renderer } from "./vm/Renderer";

export default class Configuration {
  version: number;
  action: ActionConf = new ActionConf();
  store: StoreConf = new StoreConf();
  vm: ViewModelConf = new ViewModelConf();
}

export class ActionConf {
  backend: BackendConf = new BackendConf();
}

export class BackendConf {
  apiUrl: string = "/* @echo API_URL */";
  jsonFetchPath: string = "/* @echo JSON_FETCH_PATH */" || "/demo/sample.json";
  jsonpFetchPath: string =
    "/* @echo JSONP_FETCH_PATH */" || "/demo/sample.jsonp";
  fetchCallbackPrefix: string = "__adv_cb_";
  plugins: {
    install: (model: Backend) => void
  }[] = [];
}

export class StoreConf { }

export class ViewModelConf {
  selector: string = ".adversatile";
  markedClass: string = "adv-marked";
  deviceIfaAttrName: string = "data-adv-device-ifa";
  polling: PollingConf = new PollingConf();
  prefetch: PrefetchConf[] = [];
  group: ElementGroupConf = new ElementGroupConf();
  em: ElementModelConf = new ElementModelConf();
  plugins: {
    install: (model: ViewModel) => void
  }[] = [];
}

export class PollingConf {
  interval: number = 100;
}

export class PrefetchConf {
  name: string;
  size: number;
}

export class ElementModelConf {
  idAttributeName: string = "data-adv-em-id";
  nameAttributeName: string = "data-adv-em-name";
  qualifierAttributeName: string = "data-adv-em-qualifier";
  groupAttributeName: string = "data-adv-em-group";
  useTemplateNameAttr: string = "data-adv-em-use-template-name";
  templateSelectorAttr: string = "data-adv-em-template-define";
  defaultGroup: string = "0";
  options: { [name: string]: ElementOption } = {};
  hasOption: (name: string) => boolean = function(this: ElementModelConf, name) {
    return this.options[name] !== void 0;
  };
  option: (name: string) => ElementOption = function(this: ElementModelConf, name) {
    if (!this.hasOption(name) || !(<any>this.options[name]).__init__) {
      this.options[name] = deepmerge(new ElementOption(name), this.options[name] || {});
      (<any>this.options[name]).__init__ = true;
    }
    return this.options[name];
  };
  templates: { [name: string]: string } = {};
  renderer: RendererConf = new RendererConf();
  plugins: {
    install: (model: ElementModel) => void
  }[] = [];
}

export class ElementGroupConf {
  plugins: {
    install: (model: ElementGroup) => void
  }[] = [];
}

export class ElementOption {
  constructor(public name: string) { }
  preRender: boolean = true;
  format: string = "native";
  isBanner = function(this: ElementOption): boolean {
    return this.formatIs("banner");
  };
  isNative = function(this: ElementOption): boolean {
    return this.formatIs("native");
  };
  private formatIs = function(this: ElementOption, format: string): boolean {
    return this.format === format;
  };
  assets: AssetOption[] = [];
  useTemplateName: string;
  notrim: boolean = false;
  excludedBidders: string[] = [];
  expandedClickParams: [{ name: string; value: string | number }] = <any>[];
  video: ElementVideoOption = new ElementVideoOption();
  renderer: ElementRendererOption = new ElementRendererOption();
  loop: ElementLoopOption = new ElementLoopOption();
  multiple: ElementMultipleOption = new ElementMultipleOption();
}
export class ElementRendererOption {
  adScaleRatio: string = "1.0";
  viewPortWidth: string = "device-width";
  injectMethod: string = "inner";
  injectedIframeStyle: string = "display:block;margin:0 auto;border:0pt;";
  injectedIframeScrolling: string = "no";
  injectedIframeFrameBorder: string = "0";
}
export class ElementVideoOption {
  autoReplay: boolean = true;
  playLimitCount: number = 10;
  replayDelayMillis: number = 3000;
}
export class ElementLoopOption {
  enabled: boolean = false;
  limitCount: number = 3;
}
export class ElementMultipleOption {
  enabled: boolean = false;
  sizeHint: number = 1;
  useTemplateNames: string[] = [];
}
export class AssetOption {
  constructor(public id: number, public prop: any = {}) { }
}

export class RendererConf {
  inject: InjectRendererConf = new InjectRendererConf();
  video: VideoRendererConf = new VideoRendererConf();
  markupVideo: MarkupVideoRendererConf = new MarkupVideoRendererConf();
  mainImage: MainImageRendererConf = new MainImageRendererConf();
  iconImage: IconImageRendererConf = new IconImageRendererConf();
  optoutLink: OptoutLinkRendererConf = new OptoutLinkRendererConf();
  optoutLinkOnly: OptoutLinkOnlyRendererConf = new OptoutLinkOnlyRendererConf();
  sponsoredByMessage: SponsoredByMessageRendererConf = new SponsoredByMessageRendererConf();
  titleLong: TitleLongRendererConf = new TitleLongRendererConf();
  titleShort: TitleShortRendererConf = new TitleShortRendererConf();
  link: LinkRendererConf = new LinkRendererConf();
  linkJs: LinkJsRendererConf = new LinkJsRendererConf();
  observe: ObserveRendererConf = new ObserveRendererConf();
  plugins: {
    install: (renderer: Renderer) => void
  }[] = [];
}
export class InjectRendererConf {
  selectorAttrName: string = "data-adv-renderer-inject-method";
  bannerAdImpSelector: string = "a";
}
export class VideoRendererConf {
  selectorAttrName: string = "data-adv-renderer-video";
  videoPlayerScriptUrl: string = "/* @echo VIDEO_PLAYER_SCRIPT_URI */" || "";
  videoPlayerObjectName: string = "/* @echo VIDEO_PLAYER_OBJECT_NAME */" || "";
}
export class MarkupVideoRendererConf {
  selectorAttrName: string = "data-adv-renderer-img";
  markedId: string = "adv-markup-video";
}
export class MainImageRendererConf {
  selectorAttrName: string = "data-adv-renderer-img";
}
export class IconImageRendererConf {
  selectorAttrName: string = "data-adv-renderer-icon";
}
export class OptoutLinkRendererConf {
  selectorAttrName: string = "data-adv-renderer-optout-link";
  markedClass: string = "adv-optout-image";
}
export class OptoutLinkOnlyRendererConf {
  selectorAttrName: string = "data-adv-renderer-optout-link-only";
  markedClass: string = "adv-optout-link-only-added";
  anchorTargetAttrName: string = "data-adv-anchor-target";
}
export class TitleLongRendererConf {
  selectorAttrName: string = "data-adv-renderer-title-long";
}
export class TitleShortRendererConf {
  selectorAttrName: string = "data-adv-renderer-title-short";
}
export class SponsoredByMessageRendererConf {
  selectorAttrName: string = "data-adv-renderer-sponsored-by-message";
}
export class LinkRendererConf {
  selectorAttrName: string = "data-adv-renderer-link";
  markedClass: string = "adv-link-added";
  urlPlaceholder: string = "adv-url";
  encodedUrlPlaceholder: string = "adv-encoded-url";
  anchorMarkedClass: string = "adv-anchor-link";
  anchorTargetAttrName: string = "data-adv-anchor-target";
}
export class LinkJsRendererConf {
  selectorAttrName: string = "data-adv-renderer-link-js";
  openTargetAttrName: string = "data-adv-open-target";
}
export class ObserveRendererConf {
  selectorAttrName: string = "data-adv-renderer-observe";
  observeTypeAttrName: string = "data-adv-renderer-observe-type";
  observeCallbackAttrName: string = "data-adv-renderer-observe-callback";
  selector: ObserveSelectorConf = new ObserveSelectorConf()
}
export class ObserveSelectorConf {
  observeSelectorAttrName: string = "data-adv-renderer-observe-selector";
}
export enum ObserveType {
  INVIEW,
  SELECTOR
}
export function isConfiguration(obj: any): boolean {
  return !!obj && obj.version !== void 0;
}

export function asConfituration(obj: any): Configuration {
  const configuration = assign(obj, deepmerge(new Configuration(), obj || {}));
  return configuration;
}
