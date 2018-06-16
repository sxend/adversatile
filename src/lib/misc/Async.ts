export namespace Async {
  export async function wait(condition: () => boolean, interval?: number): Promise<void> {
    return new Promise<void>(resolve => {
      const timer = setInterval(() => {
        if (condition()) {
          clearInterval(timer);
          resolve();
        }
      }, interval);
    });
  }
}