import Configuration, { ViewModelConf, ElementOption } from "./Configuration";
import { RandomId } from "./misc/RandomId";
import { Action } from "./Action";
import { Store } from "./Store";
import { ElementModel } from "./ElementModel";
import { BidRequest, NativeRequest } from "../../generated-src/protobuf/messages";
import { Dom } from "./misc/Dom";
import Adversatile from "../Adversatile";

export class ViewModel {
  constructor(
    private config: ViewModelConf,
    private store: Store,
    private action: Action
  ) {
    this.prefetch();
    this.polling();
  }
  private prefetch(): void {
    if (!this.config.prefetch || this.config.prefetch.length === 0) return;
    for (let target of this.config.prefetch) {
      const option = this.config.em.option(target.name);
      if (option.assets.length > 0) {
        const options = Array(target.size).fill(option);
        this.createBidReqByEMOptions(options);
        this.createBidReqByEMOptions(options).then(req => {
          this.action.fetchData(req);
        }).catch(console.error);
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
    Promise.all(elements.map(el => this.createElementModel(el)))
      .then((models: ElementModel[]) => {
        this.createBidReqByModels(models.filter(_ => this.isNotPrefetch(_.name))).then(
          req => this.action.fetchData(req)
        );
      })
      .catch(console.error);
  }
  private createElementModel(element: HTMLElement): Promise<ElementModel> {
    return new Promise(resolve => {
      new ElementModel(element, this.config.em, this.store, {
        onInit: model => resolve(model)
      });
    });
  }
  private isNotPrefetch(name: string): boolean {
    return !this.config.prefetch.find(_ => _.name === name);
  }
  private async createBidReqByEMOptions(emOptions: ElementOption[]): Promise<BidRequest> {
    const imp: BidRequest.IImp[] = await Promise.all(emOptions.map(async option => {
      return this.createImp(option.name, option.isNative(), option.assets);
    }));
    return this.createBidReqWithImp(imp);
  }
  private async createBidReqByModels(models: ElementModel[]): Promise<BidRequest> {
    const imp: BidRequest.IImp[] = await Promise.all(models.map(async model => {
      return this.createImp(model.name, model.isNative(), model.requireAssets());
    }));
    return this.createBidReqWithImp(imp);
  }
  private async createImp(name: string, isNative: boolean, assets: number[]) {
    const imp = new BidRequest.Imp({
      id: name,
      tagid: name,
      native: isNative ? await this.createNative(assets) : void 0,
      banner: !isNative ? await this.createBanner() : void 0
    });
    return imp;
  }
  private async createBidReqWithImp(imp: BidRequest.IImp[]): Promise<BidRequest> {
    const wdw = await Dom.TopLevelWindow;
    const siteLocation = wdw.location;
    const siteDocument = wdw.document;
    const site = new BidRequest.Site({
      page: siteLocation.href,
      domain: siteLocation.hostname,
      ref: !!siteDocument ? siteDocument.referrer : void 0
    });
    const device = new BidRequest.Device({
      ifa: this.getIfa()
    });
    const app = new BidRequest.App({
    });
    const req = new BidRequest({
      id: "1",
      imp,
      site,
      device,
      app
    });
    return req;
  }
  async createNative(assets: number[]): Promise<BidRequest.Imp.INative> {
    return new BidRequest.Imp.Native({
      requestNative: new NativeRequest({
        ver: "1",
        assets: assets.map(this.assetIdToObject)
      })
    });
  }
  async createBanner(): Promise<BidRequest.Imp.IBanner> {
    return new BidRequest.Imp.Banner({
      topframe: (await Dom.TopLevelWindow) === window
    });
  }
  private assetIdToObject(num: number): NativeRequest.Asset {
    return new NativeRequest.Asset({
      id: num
    });
  }
  private getIfa() {
    const element = document.querySelector(
      `[${this.config.deviceIfaAttrName}]`
    );
    if (element && element.getAttribute(this.config.deviceIfaAttrName)) {
      return element.getAttribute(this.config.deviceIfaAttrName);
    }
    if (Adversatile.plugin.bridge && Adversatile.plugin.bridge.ifa) {
      return Adversatile.plugin.bridge.ifa;
    }
  }
}
