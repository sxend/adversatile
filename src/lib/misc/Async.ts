export namespace Async {
  export async function wait(condition: () => boolean, interval?: number): Promise<void> {
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
    });
  }
}