export namespace Tracking {
  export function trackingCall(urls: string[], name: string): Promise<void> {
    return new Promise(resolve => {
      let timer = setTimeout(() => {
        timer = null;
        resolve();
      }, 3000);
      Promise.all(urls.map(url => createBeaconAndAppendToBody(url, name))).then(
        _ => {
          if (timer) {
            clearTimeout(timer);
            resolve();
          }
        }
      );
    });
  }
  async function createBeaconAndAppendToBody(
    url: string,
    trackingName: string
  ): Promise<void> {
    const urlWithCacheBuster: string = copyUrlWithCacheBuster(url);
    const img: HTMLImageElement = document.createElement("img");
    img.classList.add(trackingName);
    img.src = urlWithCacheBuster;
    img.style.display = "none";
    document.body.appendChild(img);
  }
  function copyUrlWithCacheBuster(url: string): string {
    url += urlHasParameter(url) ? "&" : "?";
    url += "_=" + Math.ceil(Date.now() / 1000) * Math.random();
    return url;
  }
  function urlHasParameter(url: string): boolean {
    return url.match(/\?.*=.*/i) != null;
  }
}
