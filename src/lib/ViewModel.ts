import { ViewModelConf, ElementOption } from "./Configuration";
import { Action } from "./Action";
import { Store } from "./Store";
import { ElementModel } from "./vm/ElementModel";
import { OpenRTBUtils } from "./openrtb/OpenRTBUtils";
import { OpenRTB } from "./openrtb/OpenRTB";
import { RandomId } from "./misc/RandomId";
import { groupBy } from "./misc/ObjectUtils";
import { AssetUtils } from "./openrtb/AssetUtils";
import { ElementGroup } from "./vm/ElementGroup";
import { Dom } from "./misc/Dom";
import { isEmptyArray } from "./misc/TypeCheck";

export class ViewModel {
  private groups: { [group: string]: ElementGroup } = {};
  constructor(
    private config: ViewModelConf,
    private store: Store,
    private action: Action
  ) {
    this.prefetch();
    this.polling();
    config.plugins.forEach(plugin => plugin.install(this));
  }
  private prefetch(): void {
    if (!this.config.prefetch || isEmptyArray(this.config.prefetch)) return;
    for (let target of this.config.prefetch) {
      const option = this.config.em.option(target.name);
      if (option.assets.length > 0) {
        const options = Array(target.size).fill(option);
        this.createBidReqFromElementOptions(options)
          .then(req => this.action.adcall(req))
          .catch(console.error);
      }
    }
  }
  private polling(): void {
    Dom.TopLevelDocument.then(document => {
      const poller = () => {
        try {
          this.pollElements(document);
        } catch (e) {
          console.error(e);
        }
        setTimeout(poller, this.config.polling.interval);
      };
      setTimeout(poller);
    });
  }
  private pollElements(document: Document): void {
    const newElements = [].slice
      .call(Dom.recursiveQuerySelectorAll(document, this.selector()))
      .map((element: HTMLElement) => {
        element.classList.add(this.config.markedClass);
        return element;
      });
    if (!isEmptyArray(newElements)) {
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
    const groups = groupBy(ems, (em) => em.group);
    Object.keys(groups).forEach(key => {
      if (!this.groups[key]) {
        this.groups[key] = new ElementGroup(key, this.config, this.store, this.action);
      }
      this.groups[key].register(groups[key]).catch(console.error);
    });
  }
  private createElementModel(element: HTMLElement): ElementModel {
    return new ElementModel(this.config.em, element);
  }
  private async createBidReqFromElementOptions(
    elementOptions: ElementOption[]
  ): Promise<OpenRTB.BidRequest> {
    const imp: OpenRTB.Imp[] = await Promise.all(
      elementOptions.map(elementOptionToImp)
    );
    return OpenRTBUtils.createBidReqWithImp(
      imp,
      new OpenRTB.Ext.BidRequestExt(),
      OpenRTBUtils.getIfa(this.config.deviceIfaAttrName)
    );
  }

}
async function elementOptionToImp(option: ElementOption): Promise<OpenRTB.Imp> {
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
}