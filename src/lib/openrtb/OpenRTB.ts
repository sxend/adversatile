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
    seatbid: SeatBid[] = [];
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
    ext?: Ext.BidExt;
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
    export namespace Request {
      export class Assets {
        id: number = 1;
        req: boolean = false;
        img?: Img;
        title?: Title;
        data?: Data;
      }
      export class Title {
        len: number = 0;
      }
      export enum ImgTypes {
        ICON = 1,
        LOGO,
        MAIN
      }
      export class Img {
        type?: number;
        w?: number;
        h?: number;
        wmin?: number;
        hmin?: number;
      }
      export enum DataTypes {
        SPONSORED = 1,
        DESC = 2
      }
      export class Data {
        type?: number;
        len?: number;
      }
    }

    export namespace Response {
      export class Assets {
        id: number = 1;
        req: boolean = false;
        img?: Img;
        link?: Link;
        title?: Title;
        data?: Data;
        video?: Video;
      }
      export class Img {
        url?: string;
      }
      export class Link {
        url?: string;
        clktrck: string[] = [];
        ext?: Ext.LinkExt;
      }
      export class Title {
        text?: string;
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
    export class ImpressionExt {
      excludedBidders: string[] = [];
      txid0: string = "";
      notrim: boolean = false;
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
      admNative?: NativeAd.AdResponse;
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
