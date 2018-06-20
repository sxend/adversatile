import { ElementModel } from "./ElementModel";
import { ViewModelConf } from "../Configuration";
import { OpenRTB } from "../openrtb/OpenRTB";
import { Store } from "../Store";
import { Action } from "../Action";
import { OpenRTBUtils } from "../openrtb/OpenRTBUtils";
import { AssetUtils } from "../openrtb/AssetUtils";
import { getOrElse, groupBy } from "../misc/ObjectUtils";

export class ElementGroup {
  private ems: { [id: string]: ElementModel } = {};
  constructor(
    private group: string,
    private config: ViewModelConf,
    private store: Store,
    private action: Action
  ) {
    this.config.group.plugins.forEach(plugin => plugin.install(this));
  }
  async register(ems: ElementModel[]) {
    for (let em of ems) {
      if (Object.keys(this.ems).indexOf(em.id) === -1) {
        this.ems[em.id] = em;
      }
    }
    await Promise.all(ems.map(em => new Promise(resolve => {
      em.once("init", resolve).init();
    })));
    const req = await this.createBidReqFromModels(ems);
    this.action.adcall(req);
  }
  update(response: OpenRTB.BidResponse): void {
    if (this.group !== getOrElse(() => response.ext.group)) {
      throw new Error(`invalid response.ext.group: ${getOrElse(() => response.ext.group)}`);
    }
    const sbid = getOrElse(() => response.seatbid[0]);
    if (!sbid || !sbid.bid) {
      throw new Error("is empty sbid");
    }
    const group = groupBy(sbid.bid, bid => bid.impid);
    Object.keys(group).forEach(id => {
      const em = this.ems[id];
      if (!em) return;
      em
        .once("rendered", () => {
        })
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
        .update(group[id]);
    });
  }
  private async createBidReqFromModels(
    ems: ElementModel[],
  ): Promise<OpenRTB.BidRequest> {
    const imp: OpenRTB.Imp[] = await Promise.all(
      ems.map(em => {
        const impExt = new OpenRTB.Ext.ImpressionExt();
        impExt.excludedBidders = em.excludedBidders;
        impExt.notrim = em.option.notrim;
        return OpenRTBUtils.createImp(
          em.id,
          em.name,
          em.option.format,
          em.assets.map(AssetUtils.optionToNativeAsset),
          impExt
        );
      })
    );

    return OpenRTBUtils.createBidReqWithImp(
      imp,
      new OpenRTB.Ext.BidRequestExt(this.group),
      OpenRTBUtils.getIfa(this.config.deviceIfaAttrName)
    );
  }
}