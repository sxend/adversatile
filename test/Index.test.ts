import * as puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';
import { SSL_OP_CRYPTOPRO_TLSEXT_BUG } from 'constants';
import { BrowserWrapper } from './helpers/BrowserWrapper';

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

describe("puppeteer", () => {
  jest.setTimeout(10000);
  let browserWrapper: BrowserWrapper;
  beforeEach(async (done) => {
    browserWrapper = await BrowserWrapper.build();
    browserWrapper.proxy.intercept({
      phase: 'request',
      as: 'string'
    }, function(req: any, resp: any, cycle: any) {
      resp.string = "intercept";
    });
    done();
  });
  it("sample", async (done) => {
    const page = await browserWrapper.browser.newPage().then(BrowserWrapper.bindConsole);
    await page.goto('http://example.com');
    const text = await page.evaluate(() => {
      console.log("foo", "bar");
      return document.body.innerText;
    });
    await page.close();
    expect(text).toBe("intercept");
    done();
  });
  afterEach(async (done) => {
    await browserWrapper.shutdown();
    done();
  }, 10000);
});