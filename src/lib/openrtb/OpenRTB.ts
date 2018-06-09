export namespace OpenRTB {
  export class Banner {
    constructor(
      public id?: string,
      public w?: number,
      public h?: number,
      public pos?: number,
      public topframe?: number
    ) { }
  }

  export class Native {
    constructor(
      public ver: string = "1",
      public api: string[] = [],
      public battr: string[] = [],
      public request?: NativeAd.AdRequest
    ) { }
  }
  export class App {
    constructor() { }
  }
  export class Imp {
    constructor(
      public id?: string,
      public tagid?: string,
      public banner?: Banner,
      public _native?: Native,
      public iframebuster: string[] = [],
      public ext?: Ext.ImpressionExt
    ) { }
  }
  export class Site {
    constructor(
      public page?: string,
      public domain?: string,
      public ref?: string
    ) { }
  }
  export class BidRequest {
    id: string = "1";
    imp: Imp[] = [];
    site?: Site;
    device?: Device;
    app?: App;
    ext?: ReqExt;
    constructor() {
    }
  }
  export class ReqExt {

  }

  export class Device {
    constructor(
      public dnt?: number,
      public hwv?: string,
      public carrier?: string,
      public ifa?: string,
      public uuid?: string
    ) { }
  }

  export class Bid {
    constructor(
      public price?: number,
      public impid?: string,
      public id?: string,
      public adomain: string[] = [],
      public attr: number[] = [],
      public ext?: Ext.Adhoc.BidExt,
      public adm?: string,
      public w?: number,
      public h?: number
    ) { }
  }
  export class SeatBid {
    constructor(
      public bid: Bid[] = [],
      public seat?: string,
      public group: number = 0,
      public ext?: Ext.Adhoc.SeatBidExt
    ) { }
  }
  export class BidResponse {
    constructor(public seatbid: SeatBid[] = []) { }
  }
  export namespace NativeAd {
    export class AdRequest {
      constructor(
        public ver: string = "1",
        public plcmtcnt?: number,
        public assets: Request.Assets[] = []
      ) { }
    }
    export class AdResponse {
      constructor(
        public ver: number = 1,
        public assets: Response.Assets[] = []
      ) { }
    }

    export namespace Request {
      export class Assets {
        constructor(
          public id: number = 1,
          public req: boolean = false,
          public img?: Img,
          public title?: Title,
          public data?: Data
        ) { }
      }

      export class Title {
        constructor(public len: number = 0) { } //debug
      }

      export enum ImgTypes {
        ICON = 1,
        LOGO,
        MAIN
      }

      export class Img {
        constructor(
          public type?: number,
          public w?: number,
          public h?: number,
          public wmin?: number,
          public hmin?: number
        ) { }
      }

      export enum DataTypes {
        SPONSORED = 1,
        DESC = 2
      }

      export class Data {
        constructor(public type?: number, public len?: number) { }
      }
    }

    export namespace Response {
      export class Assets {
        constructor(
          public id: number = 1,
          public req: boolean = false,
          public img?: Img,
          public link?: Link,
          public title?: Title,
          public data?: Data,
          public video?: Video
        ) { }
      }
      export class Native {
        constructor(
          public assets: Assets[] = [],
          public link?: Link,
          public imptracker?: string[],
          public jstracker?: string,
          public ext?: NativeExt
        ) { }
      }
      export class NativeExt {
        constructor(
          public html: string,
          public plcmtcnt: number,
          public adPositions: number[],
          public interval: number,
          public viewableImptrackers: string[]
        ) { }
      }
      export class Link {
        constructor(
          public url?: string,
          public clktrck: string[] = [],
          public ext?: Ext.Adhoc.LinkExt
        ) { }
      }
      export class Title {
        constructor(public text?: string) { }
      }
      export class Img {
        constructor(public url?: string) { }
      }
      export class Data {
        constructor(public value?: string) { }
      }
      export class Video {
        constructor(public vasttag?: string) { }
      }
    }
  }
  namespace Ext {
    export class ImpressionExt {
      constructor(
        public excludedBidders: string[] = [],
        public txid0: string = "",
        public notrim: boolean = false
      ) { }
    }
    export namespace Adhoc {
      export class Img {
        constructor(public url?: string) { }
      }
      export class Assets {
        constructor(
          public id?: number,
          public req: boolean = false,
          public img?: Img
        ) { }
      }
      export class LinkExt {
        constructor(public urlEncoded?: string) { }
      }
      export class BidExt {
        constructor(
          public tagid: string,
          public admNative?: NativeAd.Response.Native,
          public filler?: string,
          public bidderName?: string,
          public iMobileExtras?: IMobileExtras,
          public yahooAppExtras?: YahooAppExtras,
          public ydnExtras?: YdnExtras,
          public adcalltracker?: string,
          public txid0?: string,
          public imptrackers?: string[],
          public viewableImptrackers?: string[],
          public clickThroughUrl?: string,
          public viewThroughUrls?: string[],
          public bannerHtml?: string,
          public appId?: string
        ) { }
      }
      export class AmoadExtras {
        constructor(
          public rawContent?: string,
          public creativeTypeId?: number,
          public type?: string
        ) { }
      }
      export class TagOverride {
        constructor(
          public tagid: string,
          public plcmtcnt?: number,
          public filler?: string,
          public position?: number[]
        ) { }
      }
      export class PagePattern {
        constructor(
          public id: number,
          public displayRatio?: number,
          public tagOverrides?: TagOverride[]
        ) { }
      }
      export class SeatBidExt {
        constructor(
          public amoadExtras?: AmoadExtras,
          public noAdMessage?: string,
          public pattern?: string,
          public bidsShufflingEnabled?: boolean,
          public pagePatterns?: PagePattern[],
          public pvId?: string
        ) { }
      }
      export class IMobileExtras {
        constructor(
          public adCallUrl: string,
          public clickUrl: string,
          public imageUrl: string,
          public pid: number,
          public asid: number,
          public asn: number,
          public infeedNum: number,
          public ver: string,
          public dpr: number
        ) { }
      }
      export class YahooAppExtras {
        constructor(
          public adCallUrl: string,
          public s: string // s = yahoo tag id
        ) { }
      }
      export class YdnExtras {
        constructor(
          public adCallUrl: string,
          public type: string,
          public adformat: string,
          public callback: string,
          public ctxtUrl: string,
          public maxCount: string,
          public outputCharEnc: string,
          public ref: string,
          public source: string // source = yahoo tag id
        ) { }
      }
    }
  }
}
