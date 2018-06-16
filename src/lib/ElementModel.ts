import { ElementOption, ElementModelConf, AssetOption } from "./Configuration";
import { RandomId } from "./misc/RandomId";
import { EventEmitter } from "events";
import { OpenRTB } from "./openrtb/OpenRTB";
import { OpenRTBUtils } from "./openrtb/OpenRTBUtils";
import { Renderer, RendererContext } from "./em/Renderer";
import { MacroProps } from "./em/renderer/Macro";
import { uniqBy, uniq, onceFunction } from "./misc/ObjectUtils";

export class ElementModel extends EventEmitter {
  public id: string;
  private renderer: Renderer;
  private _excludedBidders: string[] = [];
  private detectedAssets: AssetOption[] = [];
  constructor(public element: HTMLElement, private config: ElementModelConf) {
    super();
    this.id = RandomId.gen();
    this.renderer = new Renderer(this.config, this);
    if (!this.name) {
      element.setAttribute(this.config.nameAttributeName, RandomId.gen());
    }
    this.option.plugins.forEach(plugin => plugin.install(this));
  }
  init(): ElementModel {
    if (this.option.preRender) {
      this.once("updated", () => {
        this.emit("init");
      }).update(OpenRTBUtils.dummyBid());
    } else {
      this.emit("init");
    }
    return this;
  }
  get name(): string {
    return this.element.getAttribute(this.config.nameAttributeName);
  }
  get option(): ElementOption {
    return this.config.option(this.name);
  }
  get assets(): AssetOption[] {
    let assets: AssetOption[] = this.option.assets || [];
    return uniqBy(assets.concat(this.detectedAssets), asset => asset.id);
  }
  get excludedBidders(): string[] {
    return uniq(this.option.excludedBidders.concat(this._excludedBidders));
  }
  update(bid: OpenRTB.Bid): Promise<void> {
    this.emit("update", bid);
    const context = this.createRenderContext(bid);
    return this.renderer
      .render(context)
      .then(_ => {
        this.emit("updated", bid);
      })
      .catch(console.error);
  }
  private createRenderContext(bid: OpenRTB.Bid): RendererContext {
    return {
      model: this,
      element: this.element,
      bid,
      props: this.createMacroProps(bid)
    };
  }

  private addAssetOptions(assets: AssetOption[]) {
    this.detectedAssets = uniqBy(
      this.detectedAssets.concat(assets),
      asset => asset.id
    );
  }
  private createMacroProps(bid: OpenRTB.Bid): MacroProps {
    return {
      impress: onceFunction(() => {
        this.emit("impression", bid);
      }),
      vimp: onceFunction(() => {
        this.emit("viewable_impression", bid);
      }),
      viewThrough: onceFunction(() => {
        this.emit("view_through", bid);
      }),
      addAssetOptions: (...options: AssetOption[]) =>
        this.addAssetOptions(options)
    };
  }
}
