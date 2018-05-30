import * as puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';
import { SSL_OP_CRYPTOPRO_TLSEXT_BUG } from 'constants';
import { BrowserOps } from './helpers/BrowserOps';

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

describe("puppeteer", () => {
  jest.setTimeout(10000);
  let browser: BrowserOps;
  beforeEach(async () => {
    browser = await BrowserOps.launch();
    browser.proxy.intercept({
      phase: 'request',
      as: 'string'
    }, function(req: any, resp: any, cycle: any) {
      resp.string = "intercept";
    });
  });
  it("sample", async () => {
    const page = await browser.newPage();
    await page.goto('http://example.com');
    const text = await page.evaluate(() => {
      return document.body.innerText;
    });
    await page.close();
    expect(text).toBe("intercept");
  });
  afterEach(async () => {
    await browser.shutdown();
  }, 10000);
});