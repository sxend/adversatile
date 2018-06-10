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
        this.createBidReqFromElementOptions(options)
          .then(req => {
            this.action.fetchData(req);
            this.store.once(`change:${req.id}`, (res) => console.log(res));
          })
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
    Promise.all(elements.map(el => this.createElementModel(el)))
      .then((models: ElementModel[]) => {
        this.createBidReqFromModels(
          models.filter(_ => this.isNotPrefetch(_.name))
        ).then(req => {
          this.action.fetchData(req);
          console.log(req.id);
          this.store.once(`change:${req.id}`, (res) => {
            console.log(res);
          });
        });
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
  private async createBidReqFromElementOptions(
    emOptions: ElementOption[]
  ): Promise<OpenRTB.BidRequest> {
    const imp: OpenRTB.Imp[] = await Promise.all(
      emOptions.map(async option => {
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
    models: ElementModel[]
  ): Promise<OpenRTB.BidRequest> {
    const imp: OpenRTB.Imp[] = await Promise.all(
      models.map(async model => {
        const impExt = new OpenRTB.Ext.ImpressionExt();
        impExt.excludedBidders = model.excludedBidders;
        impExt.notrim = model.option.notrim;
        return OpenRTBUtils.createImp(
          model.name,
          model.option.format,
          model.assets.map(AssetUtils.optionToNativeAsset),
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
