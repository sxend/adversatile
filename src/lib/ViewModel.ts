import { ViewModelConf, ElementOption } from "./Configuration";
import { Action } from "./Action";
import { Store } from "./Store";
import { ElementModel } from "./vm/ElementModel";
import { OpenRTBUtils, AssetUtils } from "./openrtb/OpenRTBUtils";
import { OpenRTB } from "./openrtb/OpenRTB";
import { RandomId } from "./misc/RandomId";

export class ViewModel {
  private ems: { [id: string]: ElementModel } = {};
  constructor(
    private config: ViewModelConf,
    private store: Store,
    private action: Action
  ) {
    this.prefetch();
    this.polling();
    config.plugins.forEach(plugin => plugin.install(this));
    this.store.on("AddBidResponse", (response: OpenRTB.BidResponse) => {
      const sbid = response.seatbid[0];
      if (!sbid || !sbid.bid) return;
      const group: { [id: string]: OpenRTB.Bid[] } = {};
      sbid.bid.forEach(bid => {
        (group[bid.impid] = group[bid.impid] || []).push(bid);
      });
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
    });
  }
  private prefetch(): void {
    if (!this.config.prefetch || this.config.prefetch.length === 0) return;
    for (let target of this.config.prefetch) {
      const option = this.config.em.option(target.name);
      if (option.assets.length > 0) {
        const options = Array(target.size).fill(option);
        this.createBidReqFromElementOptions(options)
          .then(req => this.action.fetchData(req))
          .catch(console.error);
      }
    }
  }
  private polling(): void {
    const poller = () => {
      try {
        this.pollElements();
      } catch (e) {
        console.error(e);
      }
      setTimeout(poller, this.config.polling.interval);
    };
    setTimeout(poller);
  }
  private pollElements(): void {
    const newElements = [].slice
      .call(document.querySelectorAll(this.selector()))
      .map((element: HTMLElement) => {
        element.classList.add(this.config.markedClass);
        return element;
      });
    if (newElements.length !== 0) {
      this.initNewElements(newElements);
    }
  }
  private selector(): string {
    const selector = this.config.selector;
    const markedClass = this.config.markedClass;
    return `${selector}:not(.${markedClass})`;
  }
  private initNewElements(elements: HTMLElement[]): void {
    const ems = elements.map(element => this.createElementModel(element));
    Promise.all(ems.map(em => new Promise(resolve => {
      em.once("init", resolve).init();
    }))).then(_ => {
      const group: { [group: string]: ElementModel[] } = {};
      ems.forEach(em => (group[em.group] = group[em.group] || []).push(em));
      Object.keys(group).forEach(g => {
        const ems = group[g];
        this.createBidReqFromModels(
          ems.filter(_ => this.isNotPrefetch(_.name))
        ).then(req => {
          this.action.fetchData(req);
        });
      });
      ems.forEach(em => {
        this.ems[em.id] = em;
      });
    });
  }
  private createElementModel(element: HTMLElement): ElementModel {
    return new ElementModel(this.config.em, element);
  }
  private isNotPrefetch(name: string): boolean {
    return !this.config.prefetch.find(_ => _.name === name);
  }
  private async createBidReqFromElementOptions(
    elementOptions: ElementOption[]
  ): Promise<OpenRTB.BidRequest> {
    const imp: OpenRTB.Imp[] = await Promise.all(
      elementOptions.map(async option => {
        const impExt = new OpenRTB.Ext.ImpressionExt();
        impExt.excludedBidders = option.excludedBidders;
        impExt.notrim = option.notrim;
        return OpenRTBUtils.createImp(
          RandomId.gen(),
          option.name,
          option.format,
          option.assets.map(AssetUtils.optionToNativeAsset),
          impExt
        );
      })
    );
    return OpenRTBUtils.createBidReqWithImp(
      imp,
      new OpenRTB.Ext.BidRequestExt(),
      OpenRTBUtils.getIfa(this.config.deviceIfaAttrName)
    );
  }
  private async createBidReqFromModels(
    ems: ElementModel[]
  ): Promise<OpenRTB.BidRequest> {
    const imp: OpenRTB.Imp[] = await Promise.all(
      ems.map(async em => {
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
    const em = ems.find(em => !!em.group);
    return OpenRTBUtils.createBidReqWithImp(
      imp,
      new OpenRTB.Ext.BidRequestExt(em.group), // FIXME adcall group
      OpenRTBUtils.getIfa(this.config.deviceIfaAttrName)
    );
  }
}
