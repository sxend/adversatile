export namespace Dom {
  export const TopLevelWindow: Promise<Window> = new Promise(resolve => {
    let current = window;
    const timer = setTimeout(() => {
      console.warn("TopLevelWindow search timeout");
      resolve(current);
    }, 50);
    function search() {
      // 今のparentがaccessableだったらcurrentにして再度探索
      if (current !== current.parent && hasFriendryParent(current)) {
        current = current.parent;
        search();
      } else {
        // 探索しようがないので終了
        clearTimeout(timer);
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
      console.log('Failed to refer window.parent.');
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
}
