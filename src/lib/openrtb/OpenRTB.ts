export namespace OpenRTB {
  export class BidRequest {
    id: string = "1";
    imp: Imp[] = [];
    site?: Site;
    device?: Device;
    app?: App;
    ext?: Ext.BidRequestExt;
  }
  export class Imp {
    id?: string;
    tagid?: string;
    banner?: Banner;
    _native?: Native;
    iframebuster: string[] = [];
    ext?: Ext.ImpressionExt;
  }
  export class Site {
    page?: string;
    domain?: string;
    ref?: string;
  }
  export class Device {
    dnt?: number;
    hwv?: string;
    carrier?: string;
    ifa?: string;
    uuid?: string;
  }
  export class App { }

  export class Banner {
    id?: string;
    w?: number;
    h?: number;
    pos?: number;
    topframe?: number;
  }
  export class Native {
    ver: string = "1";
    api: string[] = [];
    battr: string[] = [];
    request?: NativeAd.AdRequest;
  }
  export class BidResponse {
    id: string;
    seatbid: SeatBid[] = [];
    ext: Ext.BidResponseExt;
  }
  export class SeatBid {
    bid: Bid[] = [];
    seat?: string;
    group: number = 0;
    ext?: Ext.SeatBidExt;
  }
  export class Bid {
    price?: number;
    impid?: string;
    id?: string;
    adomain: string[] = [];
    attr: number[] = [];
    ext?: Ext.BidExt = new Ext.BidExt();
    adm?: string;
    w?: number;
    h?: number;
  }

  export namespace NativeAd {
    export class AdRequest {
      ver: string = "1";
      plcmtcnt?: number;
      assets: Request.Assets[] = [];
    }
    export class AdResponse {
      ver: number = 1;
      assets: Response.Assets[] = [];
      link?: Response.Link;
      imptracker?: string[];
      jstracker?: string;
      ext?: Response.NativeExt;
    }
    export enum AssetTypes {
      ICON_URL,
      IMAGE_URL,
      LEGACY_SPONSORED_BY_MESSAGE, // Deprecated. Use SPONSORED_BY_MESSAGE for RTB request.
      LEGACY_TITLE_LONG,           // Deprecated. Use DESCRIPTIVE_TEXT for RTB request.
      TITLE_SHORT,
      LOGO_URL,
      OPTOUT_IMG,
      OPTOUT_LINK,
      DESCRIPTIVE_TEXT,
      SPONSORED_BY_MESSAGE,
      MARKUP_VIDEO,
      VIDEO
    }
    export namespace Request {
      export class Assets {
        constructor(public id: number = 1, public req: boolean = false) {
        }
        img?: Img;
        title?: Title;
        data?: Data;
      }
      export class Title {
        constructor(public len: number = 0) { }
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
          public hmin?: number,
        ) { }
      }
      export enum DataTypes {
        SPONSORED = 1,
        DESC = 2
      }
      export class Data {
        constructor(
          public type?: number,
          public len?: number,
        ) { }
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
          public video?: Video,
        ) { }
      }
      export class Img {
        constructor(public url?: string) { }
      }
      export class Link {
        constructor(
          public url?: string,
          public clktrck: string[] = [],
          public ext?: Ext.LinkExt
        ) { }
      }
      export class Title {
        constructor(public text?: string) { }
      }
      export class Data {
        value?: string;
      }
      export class Video {
        vasttag?: string;
      }
      export class NativeExt {
        html: string;
        plcmtcnt: number;
        adPositions: number[];
        interval: number;
        viewableImptrackers: string[];
      }
    }
  }
  export namespace Ext {
    export class BidRequestExt { }
    export class BidResponseExt { }
    export class ImpressionExt {
      excludedBidders: string[] = [];
      notrim: boolean = false;
      txid0: string = "";
    }
    export class SeatBidExt {
      amoadExtras?: Adhoc.AmoadExtras;
      noAdMessage?: string;
      pattern?: string;
      bidsShufflingEnabled?: boolean;
      pagePatterns?: Adhoc.PagePattern[];
      pvId?: string;
    }
    export class BidExt {
      tagid: string;
      admNative?: NativeAd.AdResponse = new NativeAd.AdResponse();
      filler?: string;
      bidderName?: string;
      iMobileExtras?: Adhoc.IMobileExtras;
      yahooAppExtras?: Adhoc.YahooAppExtras;
      ydnExtras?: Adhoc.YdnExtras;
      adcalltracker?: string;
      txid0?: string;
      imptrackers?: string[];
      viewableImptrackers?: string[];
      clickThroughUrl?: string;
      viewThroughUrls?: string[];
      bannerHtml?: string;
      appId?: string;
    }
    export class LinkExt {
      urlEncoded?: string;
    }
    export namespace Adhoc {
      export class AmoadExtras {
        rawContent?: string;
        creativeTypeId?: number;
        type?: string;
      }
      export class TagOverride {
        tagid: string;
        plcmtcnt?: number;
        filler?: string;
        position?: number[];
      }
      export class PagePattern {
        id: number;
        displayRatio?: number;
        tagOverrides?: TagOverride[];
      }
      export class IMobileExtras {
        adCallUrl: string;
        clickUrl: string;
        imageUrl: string;
        pid: number;
        asid: number;
        asn: number;
        infeedNum: number;
        ver: string;
        dpr: number;
      }
      export class YahooAppExtras {
        adCallUrl: string;
        s: string; // s = yahoo tag id
      }
      export class YdnExtras {
        adCallUrl: string;
        type: string;
        adformat: string;
        callback: string;
        ctxtUrl: string;
        maxCount: string;
        outputCharEnc: string;
        ref: string;
        source: string; // source = yahoo tag id
      }
    }
  }
}
