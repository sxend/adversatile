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
  export function createScriptElement(): HTMLScriptElement {
    return document.createElement("script");
  }
  export function setGlobalCallback(id: string, callback: Function): string {
    (<any>window)[id] = callback;
    return id;
  }
  let _ready: Promise<void> = (async () => {
    const topLevelWindow: Window = await Dom.TopLevelWindow;
    const readyState = topLevelWindow.document.readyState;
    if (readyState === "complete" || (readyState !== "loading" && !(<any>topLevelWindow.document.documentElement)['doScroll'])) {
      return Promise.resolve(void 0);
    } else {
      return new Promise(resolve => {
        function loaded() {
          topLevelWindow.document.removeEventListener("DOMContentLoaded", loaded);
          window.removeEventListener("load", loaded);
          resolve(void 0);
        }
        topLevelWindow.document.addEventListener("DOMContentLoaded", loaded);
        window.addEventListener("load", loaded);
      });
    }
  })();
  export function ready(fn: Function): Promise<void> {
    return _ready = _ready.then(_ => {
      try {
        fn();
      } catch (e) {
        console.error(e);
      }
    });
  };
}
