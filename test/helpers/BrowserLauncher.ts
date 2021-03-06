import * as getPort from "get-port";
const hoxy = require("hoxy");
import * as puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

export class BrowserLauncher {
  static async launch(): Promise<BrowserLauncher> {
    const proxyPort = await getPort();
    const proxy = await BrowserLauncher.createProxyServer(proxyPort);
    const browser = await puppeteer.launch({
      headless: process.env["HEADLESS"] !== void 0 ? JSON.parse(process.env["HEADLESS"]) : true,
      args: [`--proxy-server=localhost:${proxyPort}`]
    });
    return new BrowserLauncher(browser, proxy);
  }
  static async createProxyServer(proxyPort: number) {
    const proxy = hoxy.createServer();
    await new Promise(resolve => proxy.listen(proxyPort, resolve));
    proxy.intercept({
      url: "adversatile.js", phase: 'request', as: 'string'
    }, (_req: any, resp: any, _cycle: any) => {
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
      .then(BrowserLauncher.bindConsole)
      .then(BrowserLauncher.preload);
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