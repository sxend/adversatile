import { proxyManager } from './helpers/proxy';
import * as puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';
import { SSL_OP_CRYPTOPRO_TLSEXT_BUG } from 'constants';

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

describe("puppeteer", () => {
  let manager: any;
  let browser: Browser;
  beforeEach(async () => {
    manager = await proxyManager();
    browser = await puppeteer.launch({
      args: [`--proxy-server=${manager.address}`]
    });
    manager.proxy.intercept({
      phase: 'request',
      as: 'string'
    }, function(req: any, resp: any, cycle: any) {
      resp.string = "intercept";
    });
    await manager.start();
  });
  it("sample", async (done) => {
    const page = await browser.newPage();
    await page.goto('http://example.com');
    const text = await page.evaluate(() => {
      return document.body.innerText;
    });
    expect(text).toBe("intercept");
    done();
  });
  afterEach(async () => {
    await manager.close();
    await browser.close();
  }, 10000);
});