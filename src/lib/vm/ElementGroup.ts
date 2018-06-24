import { ElementModel } from "./ElementModel";
import { ViewModelConf } from "../Configuration";
import { OpenRTB } from "../openrtb/OpenRTB";
import { Store } from "../Store";
import { Action } from "../Action";
import { OpenRTBUtils } from "../openrtb/OpenRTBUtils";
import { getOrElse, groupBy, flatten } from "../misc/ObjectUtils";
import { RouletteWheel } from "../misc/RouletteWheel";
import PagePattern = OpenRTB.Ext.Adhoc.PagePattern;

export class ElementGroup {
  private ems: { [id: string]: ElementModel } = {};
  constructor(
    private group: string,
    private config: ViewModelConf,
    private store: Store,
    private action: Action
  ) {
    this.store.on("AddBidResponse", (response: OpenRTB.BidResponse) => {
      if (!response.ext || !response.ext.group || response.ext.group !== this.group) {
        return;
      }
      this.update(response);
    });
    this.config.group.plugins.forEach(plugin => plugin.install(this));
  }
  async register(ems: ElementModel[]) {
    for (let em of ems) {
      if (Object.keys(this.ems).indexOf(em.id) === -1) {
        this.ems[em.id] = em;
        em.once("destroy", () => delete this.ems[em.id]);
      } else {
        return;
      }
    }
    const req = await this.createBidReq(ems);
    if (req.imp.length > 0) {
      this.action.adcall(req);
    }
  }
  update(response: OpenRTB.BidResponse): void {
    if (this.group !== getOrElse(() => response.ext.group)) {
      throw new Error(`invalid response.ext.group: ${getOrElse(() => response.ext.group)}`);
    }
    const sbid = getOrElse(() => response.seatbid[0]);
    if (!sbid || !sbid.bid) {
      throw new Error("is empty sbid");
    }
    this.preupdate(sbid).then(sbid => {
      const bidsGroup = groupBy(sbid.bid, bid => bid.impid);
      Object.keys(bidsGroup).forEach(id => {
        const em = this.ems[id];
        if (!em) return;
        this.updateByBids(em, bidsGroup[id]);
      });
    }).catch(console.error);
  }

  private async preupdate(sbid: OpenRTB.SeatBid): Promise<OpenRTB.SeatBid> {
    if (!sbid || !sbid.ext || !sbid.ext.pagePatterns ||
      sbid.ext.pagePatterns.length === 0) return sbid;

    const roulette = new RouletteWheel<PagePattern>(p => p.displayRatio);
    for (let pattern of sbid.ext.pagePatterns) {
      if (isAvaiablePattern(pattern, sbid.bid)) {
        roulette.add(pattern);
      }
    }
    const pattern = roulette.select();
    if (!pattern) return sbid;

    const convert = (bid: OpenRTB.Bid, tag: OpenRTB.Ext.Adhoc.TagOverride) => {
      if (tag.plcmtcnt === 0) {
        bid.ext.disabled = true;
      }
      OpenRTBUtils.setPatternToVimpTrackers(bid.ext, pattern);
      OpenRTBUtils.setPatternToClickUrls(bid.ext, pattern);
    };
    for (let tag of pattern.tagOverrides) {
      for (let bid of sbid.bid) {
        if (bid.ext.tagid === tag.tagid) {
          convert(bid, tag);
        }
      }
    }
    return sbid;
  }
  private updateByBids(em: ElementModel, bids: OpenRTB.Bid[]): void {
    if (bids.length === 0) return;
    em
      .on("impression", (bid: OpenRTB.Bid) => {
        const tracked = this.store.getState().getTrackedUrls("imp-tracking");
        const urls = OpenRTBUtils.concatImpTrackers(bid).filter(i => tracked.indexOf(i) === -1);
        this.action.tracking(urls, "imp-tracking", true);
      })
      .on("viewable_impression", (bid: OpenRTB.Bid) => {
        const tracked = this.store.getState().getTrackedUrls("viewable-imp-tracking");
        const urls = OpenRTBUtils.concatVimpTrackers(bid).filter(i => tracked.indexOf(i) === -1);
        this.action.tracking(urls, "viewable-imp-tracking", true);
      })
      .on("view_through", (bid: OpenRTB.Bid) => {
        const tracked = this.store.getState().getTrackedUrls("view-through-tracking");
        const urls = OpenRTBUtils.concatViewThroughTrackers(bid).filter(i => tracked.indexOf(i) === -1);
        this.action.tracking(urls, "view-through-tracking", true);
      })
      .update(bids);
  }
  private async createBidReq(
    ems: ElementModel[],
  ): Promise<OpenRTB.BidRequest> {
    const req = await OpenRTBUtils.createBidReqWithImp(
      flatten(await Promise.all(ems.map(em => em.imp()))),
      new OpenRTB.Ext.BidRequestExt(this.group),
      OpenRTBUtils.getIfa(this.config.deviceIfaAttrName)
    );
    return req;
  }
}
function isAvaiablePattern(pattern: PagePattern, bids: OpenRTB.Bid[]): boolean {
  for (let tag of pattern.tagOverrides) {
    const tagBids = bids.filter(bid => bid.ext.tagid === tag.tagid);
    if (tagBids.length < tag.plcmtcnt) {
      return false;
    }
  }
  return true;
}