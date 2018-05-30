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
      headless: process.env["HEADLESS"] !== void 0 ? JSON.parse(process.env["HEADLESS"]) : true,
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
  newPage(): Promise<puppeteer.Page> {
    return this.browser.newPage()
      .then(BrowserWrapper.bindConsole)
      .then(BrowserWrapper.preload);
  }
  static async preload(page: puppeteer.Page) {
    await page.evaluateOnNewDocument("");
    return page;
  }
  static async bindConsole(page: puppeteer.Page) {
    page.on('console', msg => {
      console.log.apply(console, msg.args().map(_ => `${_}`));
    });
    return page;
  }
}