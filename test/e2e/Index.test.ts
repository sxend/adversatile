import * as puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';
import { SSL_OP_CRYPTOPRO_TLSEXT_BUG } from 'constants';
import { BrowserOps } from '../helpers/BrowserOps';
import * as fs from 'fs';
import * as path from 'path';

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
describe("adversatile.js", () => {
  jest.setTimeout(10000);
  let browser: BrowserOps;
  beforeEach(async () => {
    browser = await BrowserOps.launch();
    browser.proxy.intercept({
      fullUrl: "http://example.com/index.html", phase: 'request', as: 'string'
    }, (req: any, resp: any, cycle: any) => {
      resp.string = fs.readFileSync(path.join(__dirname, "../helpers/html/index.html"));
    });
  });
  it("defined Adversatile object", async () => {
    const page = await browser.newPage();
    await page.goto('http://example.com/index.html');
    const result = await page.evaluate(function() {
      return (<any>window)['E2EResult'];
    });
    const adv = await page.evaluate(function() {
      return (<any>window)['Adversatile'];
    });
    await page.close();
    expect(result).toBeDefined();
    expect(adv.main).toBeDefined();
  });
  afterEach(async () => {
    await browser.shutdown();
  }, 10000);
});