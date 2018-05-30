import * as getPort from "get-port";
import * as hoxy from "hoxy";
import * as util from "util";
import * as puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

export class BrowserOps {
  static async launch(): Promise<BrowserOps> {
    const proxyPort = await getPort();
    const proxy = await BrowserOps.createProxyServer(proxyPort);
    const browser = await puppeteer.launch({
      headless: process.env["HEADLESS"] !== void 0 ? JSON.parse(process.env["HEADLESS"]) : true,
      args: [`--proxy-server=localhost:${proxyPort}`]
    });
    return new BrowserOps(browser, proxy);
  }
  static async createProxyServer(proxyPort: number) {
    const proxy = hoxy.createServer();
    await new Promise(resolve => proxy.listen(proxyPort, resolve));
    proxy.intercept({
      fullUrl: "http://cdn.adversatile.local/adversatile.js", phase: 'request', as: 'string'
    }, function(req: any, resp: any, cycle: any) {
      resp.string = fs.readFileSync(path.join(__dirname, "../../dist/adversatile.js"));
    });
    return proxy;
  }
  constructor(public __browser: Browser, public proxy: any) {
  }
  async shutdown() {
    await this.__browser.close();
    await new Promise((resolve, reject) => {
      this.proxy.close((err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  async newPage(): Promise<puppeteer.Page> {
    return this.__browser.newPage()
      .then(BrowserOps.bindConsole)
      .then(BrowserOps.preload);
  }
  static async preload(page: puppeteer.Page): Promise<puppeteer.Page> {
    await page.evaluateOnNewDocument(fs.readFileSync(path.join(__dirname, "js/preload.js")).toString());
    return page;
  }
  static async bindConsole(page: puppeteer.Page): Promise<puppeteer.Page> {
    page.on('console', msg => {
      console.log.apply(console, msg.args().map(_ => `${_}`));
    });
    return page;
  }
}