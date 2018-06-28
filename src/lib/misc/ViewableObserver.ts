import { isDefined } from "./TypeCheck";

const threshold = Array(101)
  .fill(0)
  .map((_, i) => i / 100);

// is tentative implementation
export class ViewableObserver {
  private internal: Promise<IntersectionObserver>;
  constructor(private callback: (ratio: number) => void) {
    if ("IntersectionObserver" in window) {
      this.internal = Promise.resolve(
        new IntersectionObserver(
          event => {
            if (!event || !event[0]) return;
            this.callback(event[0].intersectionRatio);
          },
          {
            threshold: threshold
          }
        )
      );
    } else {
      // FIXME load polyfill
    }
  }
  observe(target: Element): void {
    this.internal.then(_ => _.observe(target));
  }
  unobserve(target: Element): void {
    this.internal.then(_ => _.unobserve(target));
  }
}
export namespace ViewableObserver {
  export function onceInview(target: HTMLElement, callback: () => void) {
    let ratio = 0.5;
    const height = isDefined(window.innerHeight) ? window.innerHeight : document.body.clientHeight;
    if (height < target.clientHeight) {
      ratio = height / target.clientHeight - 0.01;
    }
    once(target, ratio, 1000, callback);
  }
  export function once(
    target: HTMLElement,
    ratio: number,
    time: number,
    callback: () => void
  ) {
    let timer: any;
    const observer = new ViewableObserver(currentRatio => {
      if (currentRatio < ratio) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      } else {
        if (!timer) {
          timer = setTimeout(() => {
            callback();
            observer.unobserve(target);
          }, time);
        }
      }
    });
    observer.observe(target);
  }
}
