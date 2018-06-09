export namespace OpenRTB {
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
  export class App { }
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
  export class BidRequest {
    id: string = "1";
    imp: Imp[] = [];
    site?: Site;
    device?: Device;
    app?: App;
    ext?: ReqExt;
  }
  export class ReqExt { }

  export class Device {
    dnt?: number;
    hwv?: string;
    carrier?: string;
    ifa?: string;
    uuid?: string;
  }

  export class Bid {
    price?: number;
    impid?: string;
    id?: string;
    adomain: string[] = [];
    attr: number[] = [];
    ext?: Ext.Adhoc.BidExt;
    adm?: string;
    w?: number;
    h?: number;
  }
  export class SeatBid {
    bid: Bid[] = [];
    seat?: string;
    group: number = 0;
    ext?: Ext.Adhoc.SeatBidExt;
  }
  export class BidResponse {
    seatbid: SeatBid[] = [];
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
      export class Native {
        assets: Assets[] = [];
        link?: Link;
        imptracker?: string[];
        jstracker?: string;
        ext?: NativeExt;
      }
      export class NativeExt {
        html: string;
        plcmtcnt: number;
        adPositions: number[];
        interval: number;
        viewableImptrackers: string[];
      }
      export class Link {
        url?: string;
        clktrck: string[] = [];
        ext?: Ext.Adhoc.LinkExt;
      }
      export class Title {
        text?: string;
      }
      export class Img {
        url?: string;
      }
      export class Data {
        value?: string;
      }
      export class Video {
        vasttag?: string;
      }
    }
  }
  namespace Ext {
    export class ImpressionExt {
      excludedBidders: string[] = [];
      txid0: string = "";
      notrim: boolean = false;
    }
    export namespace Adhoc {
      export class Img {
        url?: string;
      }
      export class Assets {
        id?: number;
        req: boolean = false;
        img?: Img;
      }
      export class LinkExt {
        urlEncoded?: string;
      }
      export class BidExt {
        tagid: string;
        admNative?: NativeAd.Response.Native;
        filler?: string;
        bidderName?: string;
        iMobileExtras?: IMobileExtras;
        yahooAppExtras?: YahooAppExtras;
        ydnExtras?: YdnExtras;
        adcalltracker?: string;
        txid0?: string;
        imptrackers?: string[];
        viewableImptrackers?: string[];
        clickThroughUrl?: string;
        viewThroughUrls?: string[];
        bannerHtml?: string;
        appId?: string;
      }
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
      export class SeatBidExt {
        amoadExtras?: AmoadExtras;
        noAdMessage?: string;
        pattern?: string;
        bidsShufflingEnabled?: boolean;
        pagePatterns?: PagePattern[];
        pvId?: string;
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
