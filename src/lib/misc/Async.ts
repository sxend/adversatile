export namespace Async {
  export async function wait(condition: () => boolean, interval?: number): Promise<void> {
    return new Promise<void>(resolve => {
      const timer = setInterval(() => {
        try {
          if (condition()) {
            clearInterval(timer);
            resolve();
          }
        } catch (e) {
          console.error();
        }
      }, interval);
    });
  }
}