import { isDefined } from "./TypeCheck";

export namespace Async {
  export async function wait(
    condition: () => boolean,
    interval?: number,
    timeout?: number,
    timeoutWithError: boolean = false): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setInterval(() => {
        try {
          if (condition()) {
            clearInterval(timer);
            resolve();
          }
        } catch (e) {
          clearInterval(timer);
          reject(e);
        }
      }, interval);
      if (isDefined(timeout)) {
        setTimeout(() => {
          clearInterval(timer);
          if (timeoutWithError) {
            reject(new Error("timeout"));
          } else {
            resolve();
          }
        }, timeout);
      }
    });
  }
  export async function waitAndGet<A>(fn: () => A,
    interval?: number,
    timeout?: number,
    timeoutWithError: boolean = false): Promise<A> {
    await wait(() => isDefined(fn()), interval, timeout, timeoutWithError);
    return fn();
  }
}