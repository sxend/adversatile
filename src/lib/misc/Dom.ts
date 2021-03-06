import { isDefined } from "./TypeCheck";

export namespace Dom {
  export const TopLevelWindow: Promise<Window> = new Promise(resolve => {
    let current = window;
    let timer = setTimeout(() => {
      console.warn("TopLevelWindow search timeout");
      timer = null;
      resolve(current);
    }, 100);
    function search() {
      // 今のparentがaccessableだったらcurrentにして再度探索
      if (current !== current.parent && hasFriendryParent(current)) {
        current = current.parent;
        if (!!timer) {
          setTimeout(() => search());
        }
      } else {
        // 探索しようがないので終了
        clearTimeout(timer);
        timer = null;
        resolve(current);
      }
    }
    search();
  });
  export const TopLevelDocument: Promise<Document> = TopLevelWindow.then(_ => _.document);
  export async function callOnTopLevelOnce<A>(id: string, callback: () => A, resetOnWindowUnload: boolean = true): Promise<A> {
    const topWindow = (<any>await Dom.TopLevelWindow);
    const promise = topWindow[id];
    if (isDefined(promise)) {
      return promise;
    }
    if (resetOnWindowUnload) {
      window.addEventListener("unload", async () => {
        delete topWindow[id];
      });
    }
    return topWindow[id] = Promise.resolve(callback());
  }
  export const canViewportIntersectionMeasurement = TopLevelWindow.then(
    x => x === window.top
  );
  export function isInIframe(w: Window): boolean {
    try {
      return w !== w.parent;
    } catch (e) {
      console.log("Failed to refer window.parent.");
    }
    return false;
  }
  function hasFriendryParent(wdw: Window) {
    try {
      return (
        (wdw.parent.location.protocol === wdw.location.protocol &&
          wdw.parent.location.hostname === wdw.location.hostname &&
          wdw.parent.location.port === wdw.location.port) ||
        wdw.location.protocol === "about:"
      );
    } catch (e) { }
    return false;
  }

  export function getOwnerIFrame(window: Window, element: HTMLElement): HTMLIFrameElement {
    const iframes = <HTMLIFrameElement[]>recursiveQuerySelectorAll(window.document, friendryIframeSelector);
    for (var frame of iframes) {
      if (frame.contentDocument && frame.contentDocument.body && frame.contentDocument.body.contains(element)) {
        return frame;
      }
    }
    return void 0;
  }

  export function createScriptElement(): HTMLScriptElement {
    return document.createElement("script");
  }

  const friendryIframeSelector: string = [
    `iframe:not([src])`,
    `iframe[src="about:self"]`,
    `iframe[src^="//${window.location.host}"]`,
    `iframe[src^="${window.location.origin}"]`,
    'iframe:not([src*="//"])'
  ].join(",");

  export function recursiveQuerySelectorAll(
    element: ParentNode,
    selector: string
  ): Node[] {
    const frames = [].slice.call(
      element.querySelectorAll(friendryIframeSelector)
    );
    return frames.reduce(
      (prev: Node[], cur: HTMLIFrameElement) =>
        prev.concat(recursiveQuerySelectorAll(cur.contentDocument, selector)),
      [].slice.call(element.querySelectorAll(selector))
    );
  }
  export function recursiveQuerySelector(
    element: ParentNode,
    selector: string
  ): Node {
    return recursiveQuerySelectorAll(element, selector)[0];
  }
  export function setGlobalCallback(id: string, callback: Function): string {
    (<any>window)[id] = callback;
    return id;
  }
  export function setTopWindowCallback(id: string, callback: Function): Promise<string> {
    return TopLevelWindow.then(topW => {
      (<any>topW)[id] = callback;
      return id;
    });
  }
  let _ready: Promise<void> = (async () => {
    const topLevelWindow: Window = await Dom.TopLevelWindow;
    const readyState = topLevelWindow.document.readyState;
    if (
      readyState === "complete" ||
      (readyState !== "loading" &&
        !(<any>topLevelWindow.document.documentElement)["doScroll"])
    ) {
      return Promise.resolve(void 0);
    } else {
      return new Promise(resolve => {
        function loaded() {
          topLevelWindow.document.removeEventListener(
            "DOMContentLoaded",
            loaded
          );
          window.removeEventListener("load", loaded);
          resolve(void 0);
        }
        topLevelWindow.document.addEventListener("DOMContentLoaded", loaded);
        window.addEventListener("load", loaded);
      });
    }
  })();
  export function ready(fn: Function): Promise<void> {
    return (_ready = _ready.then(_ => {
      try {
        fn();
      } catch (e) {
        console.error(e);
      }
    }));
  }
  export function fireScript(target: HTMLElement) {
    const scripts: HTMLScriptElement[] =
      target.nodeName === "SCRIPT"
        ? [<HTMLScriptElement>target]
        : <HTMLScriptElement[]>recursiveQuerySelectorAll(target, "script");

    for (let script of scripts) {
      const cloned = copyScriptWithAllAttribute(script);
      cloned.classList.add("cloned");
      script.parentElement.replaceChild(cloned, script);
    }
  }
  function copyScriptWithAllAttribute(script: HTMLScriptElement) {
    var target: HTMLScriptElement = document.createElement("script");
    [].slice.call(script.attributes).forEach((attribute: Attr) => {
      target.setAttribute(attribute.name, attribute.value);
    });
    target.innerHTML = script.innerHTML;
    return target;
  }
  export function stringToElements(str: string): Element[] {
    const container = document.createElement('div');
    container.innerHTML = str;
    const elements = [].slice.call(container.children);
    container.textContent = "";
    return elements;
  }
  export function onScroll(callback: () => void): void {
    Dom.TopLevelWindow.then(_ => _.addEventListener('scroll', callback));
  }
  export function onScrollEnd(thresholdMillis: number, callback: () => void) {
    let timerId: any;
    onScroll(() => {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      timerId = setTimeout(function() {
        timerId = null;
        callback();
      }, thresholdMillis);
    });
  }
}
