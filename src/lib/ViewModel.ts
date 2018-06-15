import Configuration, { ViewModelConf, ElementOption } from "./Configuration";
import { RandomId } from "./misc/RandomId";
import { Action } from "./Action";
import { Store } from "./Store";
import { ElementModel } from "./ElementModel";
import { Dom } from "./misc/Dom";
import Adversatile from "../Adversatile";
import { OpenRTBUtils, AssetUtils } from "./openrtb/OpenRTBUtils";
import { OpenRTB } from "./openrtb/OpenRTB";

export class ViewModel {
  private ems: { [name: string]: ElementModel[] } = {};
  constructor(
    private config: ViewModelConf,
    private store: Store,
    private action: Action
  ) {
    this.prefetch();
    this.polling();
    this.store.on("AddBidResponse", (response: OpenRTB.BidResponse) => {
      const sbid = response.seatbid[0];
      if (!sbid) return;
      sbid.bid.forEach(bid => {
        const ems = this.ems[bid.impid];
        if (!ems || ems.length === 0) return;
        ems.forEach(em => {
          em
            .once("rendered", () => console.log("rendered"))
            .once("impression", () => console.log("impression"))
            .once("inview", () => console.log("inview"))
            .update(bid)
        });
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
      this.createBidReqFromModels(
        ems.filter(_ => this.isNotPrefetch(_.name))
      ).then(req => {
        this.action.fetchData(req);
      });
      ems.forEach(em => {
        (this.ems[em.name] = this.ems[em.name] || []).push(em);
      });
    });
  }
  private createElementModel(element: HTMLElement): ElementModel {
    return new ElementModel(element, this.config.em, this.store, {});
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
          em.name,
          em.option.format,
          em.assets.map(AssetUtils.optionToNativeAsset),
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
}
