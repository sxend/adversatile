import * as getPort from "get-port";
import * as util from "util";

export async function proxyManager() {
  const proxyPort = await getPort();
  const proxy = require('hoxy').createServer();
  return {
    address: `localhost:${proxyPort}`,
    proxy: proxy,
    start: async () => new Promise((resolve) => {
      proxy.listen(proxyPort, "localhost", resolve);
    }),
    close: async () => new Promise((resolve, reject) => {
      proxy.close((err: any) => {
        if (err) return reject(err);
        resolve();
      });
    })
  };
}
