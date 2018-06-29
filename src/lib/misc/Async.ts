import { isDefined } from "./TypeCheck";

export namespace Async {
  export async function wait(condition: () => boolean, interval?: number, timeout?: number, timeoutWithError: boolean = false): Promise<void> {
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
}