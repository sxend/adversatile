import { ElementModel, UpdateDynamic, UpdateContext } from "./ElementModel";
import { ViewModelConf } from "../Configuration";
import { OpenRTB } from "../openrtb/OpenRTB";
import { Store } from "../Store";
import { Action } from "../Action";
import { OpenRTBUtils } from "../openrtb/OpenRTBUtils";
import { getOrElse, groupBy, flatten, contains, uniqBy } from "../misc/ObjectUtils";
import { RouletteWheel } from "../misc/RouletteWheel";
import PagePattern = OpenRTB.Ext.Adhoc.PagePattern;
import { isEmptyArray } from "../misc/TypeCheck";
import { RendererContext } from "./Renderer";
import Analytics from "../misc/Analytics";

export class ElementGroup {
  private ems: { [id: string]: ElementModel } = {};
  constructor(
    private group: string,
    private config: ViewModelConf,
    private store: Store,
    private action: Action
  ) {
    this.store.on("AddBidResponse", (response: OpenRTB.BidResponse) => {
      const request = this.store.getBidRequest(response.id);
      if (!request || !response.ext || !response.ext.group || response.ext.group !== this.group) {
        return;
      }
      this.update(request, response);
    });
    this.config.group.plugins.forEach(plugin => plugin.install(this));
  }
  async register(ems: ElementModel[]) {
    for (let em of ems) {
      if (Object.keys(this.ems).indexOf(em.id) === -1) {
        this.ems[em.id] = em;
        this.setEvents(em);
      } else {
        return;
      }
    }
    const req = await this.createBidReq(ems);
    if (req.imp.length > 0) {
      this.action.adcall(req);
    }
  }
  update(request: OpenRTB.BidRequest, response: OpenRTB.BidResponse): void {
    if (this.group !== getOrElse(() => response.ext.group)) {
      throw new Error(`invalid response.ext.group: ${getOrElse(() => response.ext.group)}`);
    }
    const sbid = getOrElse(() => response.seatbid[0]);
    if (!sbid || !sbid.bid) {
      throw new Error("is empty sbid");
    }
    const pattern = selectPattern(sbid);
    const bidsGroup = groupBy(sbid.bid, bid => bid.impid);
    const updated: string[] = [];
    Object.keys(bidsGroup).forEach(id => {
      const em = this.ems[id];
      if (!em) return;
      const override = getOrElse(() => pattern.tagOverrides.find(tag => tag.tagid === em.name));
      const context = new UpdateContext(bidsGroup[id], new UpdateDynamic(pattern, override));
      em.update(context);
      updated.push(em.id);
    });
    uniqBy(request.imp, imp => imp.id).forEach(imp => {
      if (contains(updated, imp.id) || !this.ems[imp.id]) return;
      const em = this.ems[imp.id];
      em.update(new UpdateContext([]));
    });
    this.action.consumeBidReqRes(request, response);
  }
  private setEvents(em: ElementModel): void {
    em
      .on("impression", (context: RendererContext) => {
        const tracked = this.store.getTrackedUrls("imp-tracking");
        const urls = OpenRTBUtils.concatImpTrackers(context.bid).filter(i => tracked.indexOf(i) === -1);
        this.action.tracking(urls, "imp-tracking");
      })
      .on("viewable_impression", (context: RendererContext) => {
        const tracked = this.store.getTrackedUrls("viewable-imp-tracking");
        const urls = OpenRTBUtils.concatVimpTrackers(context.bid).filter(i => tracked.indexOf(i) === -1);
        this.action.tracking(urls, "viewable-imp-tracking");
        Analytics("send", {
          "dimension:page_histories": [
            { "dimension:inview": 1 }
          ]
        });
      })
      .on("view_through", (context: RendererContext) => {
        const tracked = this.store.getTrackedUrls("view-through-tracking");
        const urls = OpenRTBUtils.concatViewThroughTrackers(context.bid).filter(i => tracked.indexOf(i) === -1);
        this.action.tracking(urls, "view-through-tracking");
      })
      .on("click", (_context: RendererContext) => {
      });
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
function selectPattern(sbid: OpenRTB.SeatBid): PagePattern {
  if (!sbid || !sbid.ext || !sbid.ext.pagePatterns ||
    isEmptyArray(sbid.ext.pagePatterns)) return void 0;

  const roulette = new RouletteWheel<PagePattern>(p => p.displayRatio);
  for (let pattern of sbid.ext.pagePatterns) {
    if (isAvaiablePattern(pattern, sbid.bid)) {
      roulette.add(pattern);
    }
  }
  const pattern = roulette.select();
  if (!pattern) return void 0;

  for (let tag of pattern.tagOverrides) {
    for (let bid of sbid.bid) {
      if (bid.ext.tagid === tag.tagid) {
        OpenRTBUtils.setPatternToVimpTrackers(bid.ext, pattern);
        OpenRTBUtils.setPatternToClickUrls(bid.ext, pattern);
      }
    }
  }
  return pattern;
}