import * as getPort from "get-port";
import * as util from "util";
import * as puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';
export class BrowserWrapper {
  static async build(): Promise<BrowserWrapper> {
    const proxyPort = await getPort();
    const proxy = require('hoxy').createServer();
    await new Promise(resolve => proxy.listen(proxyPort, resolve));
    const browser = await puppeteer.launch({
      args: [`--proxy-server=localhost:${proxyPort}`]
    });
    return new BrowserWrapper(browser, proxy);
  }
  constructor(public browser: Browser, public proxy: any) {
  }
  async shutdown() {
    await this.browser.close();
    await new Promise((resolve, reject) => {
      this.proxy.close((err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}