export interface OldConfiguration {

  version: number;
  elementClass: string;
  spotId: string;
  tagId: string;
  reload: boolean;
  templateName: string;
  templateId: string;
  titleLength: number;
  extendTemplateUrl: string;
  priority: number;
  defaultSponsoredByMessage: string;
  defaultTitleShort: string;
  defaultTitleLong: string;
  isSwipeAd: boolean;
  expandedClickParams: [{ name: string; value: string | number }];
  swipeAdStyle: NativeWebTemplate;
  adInIframe: boolean;
  templateHtml: string;
  templateHtmlsByPattern: { [id: string]: string };
  preRender: boolean;
  adPoolExpireMillSeconds: number;
  assets: { name: string, prop: any }[];
  onpfxadrender: (ads: any, scope: any) => void;
  onpfxadrendered: (ads: any, adUnit: any, adElement?: HTMLElement) => void;
  onpfxadinview: () => void;
  onpatternselected: (pattern: any, tag: any, scope: any) => void;
  displayAreaParentNode: (pattern: any, tag: any, scope: any) => Node;
  adjustDisplayArea: (pattern: any, tag: any, scope: any) => void;
  pfxImgClassName: string;
  plugin: string;
  adFormat: string; // banner or video or native
  activeOverlaySetting: ActiveOverlaySetting;
  sdkIntegrationSetting: SDKIntegrationSetting;
  notrim: boolean;
  videoSetting: IVideoSetting;
}
export interface ActiveOverlaySetting {
  enabled: boolean;
  appearancePercentageFromBottom: number;
  transitionSeconds: number;
  initialOpacity: number;
  scrollEndMillis: number;
  zIndex: number;
  enableExpandFullWidth: boolean;
  enableFixToTopAtScrollEnded: boolean;
}
export interface SDKIntegrationSetting {
  enabled: boolean;
}
export interface IVideoSetting {
  autoReplay: boolean;
  replayDelayMillis: number;
}
export interface NativeWebTemplate {
  adsContainer: string;
  adContainer: string;
  adTemplate: string;
  adSize: SwipeAdSize;
}
export interface SwipeAdSize {
  adWidth: number;
  adHeight: number;
}