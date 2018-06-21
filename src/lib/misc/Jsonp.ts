// import { Dom } from "./Dom";
export namespace Jsonp {
  export function fetch(_url: string, _callbackName: string): Promise<any> {
    return new Promise(resolve => {
      resolve({
        "bid": [{
          "price": 0.0,
          "adomain": [],
          "id": "",
          "attr": [],
          "ext": {
            "tagid": "10005",
            "admNative": {
              "imptracker": ["https://stg-ad.caprofitx.adtdp.com/v1/impression/2621d7f2-b229-4692-9feb-1b8796f9598e/?txidmap=JGIBD8bGfSdPIreqEGNlVdSt352m5ywYzz4DT%2BA6ChOfjam%2Bc37Yr5s4%2FnfDUOKVcIie2Tl7vNTznDCzWikfymXLrfi9WRyKsgRcpoKHwJ8%3D", "https://stg-m.amoad.net/imp/?cid=52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5&ssl=1", "https://sync.fout.jp/sync?xid=caprofitx", "https://tg.socdm.com/aux/idsync?proto=profitx", "https://gocm.c.appier.net/cprofit", "https://x.bidswitch.net/sync?ssp=profitx", "https://cm.send.microad.jp/px/cm", "https://adn-d.sp.gmossp-sp.jp/csync/?nid=211&sync=profitx&uid=73fcb24c-f704-4457-84a6-d64e5bd69ce9&rd=https%3A%2F%2Fad.caprofitx.adtdp.com%2Fv1%2Fcookiesync%3Fakane_uid%3D", "https://ds.uncn.jp/px/0/sync_push"],
              "link": {
                "clktrck": ["https://stg-ad.caprofitx.adtdp.com/v1/clicktrack/2621d7f2-b229-4692-9feb-1b8796f9598e/?txidmap=JGIBD8bGfSdPIreqEGNlVdSt352m5ywYzz4DT%2BA6ChOfjam%2Bc37Yr5s4%2FnfDUOKVcIie2Tl7vNTznDCzWikfyjS%2FBHwHRYmZlq3wOqMh1IDkqszAWrHDqIaoei2nfzn2kxhGqWzF6hFR5vmzX%2BTNHlWQsjRgxwjrGhgHLokgmPg%3D"],
                "url": "https://stg-ad.caprofitx.adtdp.com/v1/click/2621d7f2-b229-4692-9feb-1b8796f9598e/?txidmap=JGIBD8bGfSdPIreqEGNlVdSt352m5ywYzz4DT%2BA6ChOfjam%2Bc37Yr5s4%2FnfDUOKVcIie2Tl7vNTznDCzWikfyjS%2FBHwHRYmZlq3wOqMh1IDkqszAWrHDqIaoei2nfzn2kxhGqWzF6hFR5vmzX%2BTNHlWQsjRgxwjrGhgHLokgmPg%3D&rd=http%3A%2F%2Fstg-d.amoad.net%2Fclick%2F%3Fcid%3D52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5"
              },
              "assets": [{
                "req": false,
                "img": {
                  "url": "https://stg-i.amoad.net/creatives/659/af6/4f8/b1d6e4443dd91d6d1491383371119679_original.png"
                },
                "id": 1
              }, {
                "req": false,
                "img": {
                  "url": "https://stg-i.amoad.net/creatives/8ae/a56/e91/000.jpg"
                },
                "id": 2
              }, {
                "req": false,
                "title": {
                  "text": "グノシー"
                },
                "id": 5
              }, {
                "req": false,
                "title": {
                  "text": "グノシー　エンタメニュース・スポーツニュースから社会・経済ニュースまでまとめ読み"
                },
                "id": 4
              }, {
                "req": false,
                "title": {
                  "text": "Gunosy"
                },
                "id": 3
              }, {
                "link": {
                  "clktrck": [],
                  "url": "http://stg-d.amoad.net/guideline/"
                },
                "req": false,
                "img": {
                  "url": "https://cdn.caprofitx.com/static/imark.png"
                },
                "id": 7
              }, {
                "req": false,
                "video": {
                  "vasttag": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><VAST version=\"2.0\"><Ad id=\"52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5ad\"><InLine><AdSystem>2.0</AdSystem><AdTitle>914112</AdTitle><Impression id=\"1stParty\"></Impression><Creatives><Creative><Linear><Duration>00:00:14.04</Duration><TrackingEvents><Tracking event=\"creativeView\"><![CDATA[https://stg-at.amoad.net/vcv/?cid=52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"start\"><![CDATA[https://stg-at.amoad.net/vs/?cid=52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"firstQuartile\"><![CDATA[https://stg-at.amoad.net/vfq/?cid=52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"midpoint\"><![CDATA[https://stg-at.amoad.net/vm/?cid=52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"thirdQuartile\"><![CDATA[https://stg-at.amoad.net/vtq/?cid=52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"complete\"><![CDATA[https://stg-at.amoad.net/vc/?cid=52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"progress\" offset=\"00:00:05\"><![CDATA[https://stg-at.amoad.net/vp/?cid=52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"fullscreen\"><![CDATA[https://stg-at.amoad.net/vfs/?cid=52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"closeLinear\"><![CDATA[https://stg-at.amoad.net/vcl/?cid=52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5&vivr=${inview_ratio}&ssl=1]]></Tracking></TrackingEvents><VideoClicks><ClickThrough id=\"1\"><![CDATA[http://stg-d.amoad.net/click/?cid=52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5]]></ClickThrough></VideoClicks><MediaFiles><MediaFile width=\"640\" height=\"360\" type=\"video/mp4\" delivery=\"progressive\"><![CDATA[https://stg-i.amoad.net/creatives/8ae/a56/e91/video.mp4]]></MediaFile><MediaFile width=\"640\" height=\"360\" type=\"video/webm\" delivery=\"progressive\"><![CDATA[https://stg-i.amoad.net/creatives/8ae/a56/e91/video.webm]]></MediaFile></MediaFiles></Linear></Creative></Creatives><Extensions><Extension service=\"amoad\" playType=\"banner\" isAutoRepeat=\"false\" repeatWait=\"5\" soundSetting=\"OFF\" volumeRatio=\"0.5\" enableInlineVideoPlayer=\"false\" autoPlay=\"true\" inviewRatio=\"0.5\" outviewRatio=\"0.9\"><ReplaceImage creativeType=\"image/jpeg\" width=\"640\" height=\"360\"><![CDATA[https://stg-i.amoad.net/creatives/8ae/a56/e91/000.jpg]]></ReplaceImage><EndCard creativeType=\"image/jpeg\" width=\"640\" height=\"360\"><![CDATA[https://stg-i.amoad.net/creatives/2bd/51f/8b7/abe79e5c6e46f96a1491383408303861_original.jpg]]></EndCard><LPURL id=\"lpurl\"><![CDATA[]]></LPURL></Extension></Extensions></InLine></Ad></VAST>"
                },
                "id": 12
              }, {
                "link": {
                  "clktrck": [],
                  "url": "http://stg-d.amoad.net/guideline/"
                },
                "req": false,
                "id": 8
              }],
              "ext": {
                "plcmtcnt": 2,
                "interval": 0,
                "viewableImptrackers": ["https://stg-ad.caprofitx.adtdp.com/v1/viewable_impression/2621d7f2-b229-4692-9feb-1b8796f9598e/?txidmap=JGIBD8bGfSdPIreqEGNlVdSt352m5ywYzz4DT%2BA6ChOfjam%2Bc37Yr5s4%2FnfDUOKVcIie2Tl7vNTznDCzWikfyjS%2FBHwHRYmZlq3wOqMh1IDkqszAWrHDqIaoei2nfzn2kxhGqWzF6hFR5vmzX%2BTNHlWQsjRgxwjrGhgHLokgmPg%3D", "https://stg-v.amoad.net/vimp/?cid=52edaa06a852288850bf270aa08d10e571cee5791634176b37282410279f72ead173f85d608c89ba01e3ad5a864701966e6dfcfa6ff08831c8802dac453549e404373b58e9fd33821d26f21d5efc22f5"],
                "adPositions": [1, 5, 8, 13, 21]
              }
            },
            "viewThroughUrls": ["https://stg-ad.caprofitx.adtdp.com/v1/view_through/2621d7f2-b229-4692-9feb-1b8796f9598e/?txidmap=JGIBD8bGfSdPIreqEGNlVdSt352m5ywYzz4DT%2BA6ChOfjam%2Bc37Yr5s4%2FnfDUOKVcIie2Tl7vNTznDCzWikfyjS%2FBHwHRYmZlq3wOqMh1IDkqszAWrHDqIaoei2nfzn2kxhGqWzF6hFR5vmzX%2BTNHlWQsjRgxwjrGhgHLokgmPg%3D"],
            "bidderName": "afio",
            "expiresInSec": 1800,
            "appId": "com.attendify.confwc659h"
          },
          "cat": [],
          "impid": "1"
        }, {
          "price": 0.0,
          "adomain": [],
          "id": "",
          "attr": [],
          "ext": {
            "tagid": "10005",
            "admNative": {
              "imptracker": ["https://stg-ad.caprofitx.adtdp.com/v1/impression/2621d7f2-b229-4692-9feb-1b8796f9598e/?txidmap=JGIBD8bGfSdPIreqEGNlVdSt352m5ywYzz4DT%2BA6ChOfjam%2Bc37Yr5s4%2FnfDUOKVVP%2BrCG39e6tYAR7b74O13WXLrfi9WRyKsgRcpoKHwJ8%3D", "https://stg-m.amoad.net/imp/?cid=9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c&ssl=1", "https://sync.fout.jp/sync?xid=caprofitx", "https://tg.socdm.com/aux/idsync?proto=profitx", "https://gocm.c.appier.net/cprofit", "https://x.bidswitch.net/sync?ssp=profitx", "https://cm.send.microad.jp/px/cm", "https://adn-d.sp.gmossp-sp.jp/csync/?nid=211&sync=profitx&uid=73fcb24c-f704-4457-84a6-d64e5bd69ce9&rd=https%3A%2F%2Fad.caprofitx.adtdp.com%2Fv1%2Fcookiesync%3Fakane_uid%3D", "https://ds.uncn.jp/px/0/sync_push"],
              "link": {
                "clktrck": ["https://stg-ad.caprofitx.adtdp.com/v1/clicktrack/2621d7f2-b229-4692-9feb-1b8796f9598e/?txidmap=JGIBD8bGfSdPIreqEGNlVdSt352m5ywYzz4DT%2BA6ChOfjam%2Bc37Yr5s4%2FnfDUOKVVP%2BrCG39e6tYAR7b74O13TS%2FBHwHRYmZlq3wOqMh1IDkqszAWrHDqIaoei2nfzn2kxhGqWzF6hFR5vmzX%2BTNHlWQsjRgxwjrGhgHLokgmPg%3D"],
                "url": "https://stg-ad.caprofitx.adtdp.com/v1/click/2621d7f2-b229-4692-9feb-1b8796f9598e/?txidmap=JGIBD8bGfSdPIreqEGNlVdSt352m5ywYzz4DT%2BA6ChOfjam%2Bc37Yr5s4%2FnfDUOKVVP%2BrCG39e6tYAR7b74O13TS%2FBHwHRYmZlq3wOqMh1IDkqszAWrHDqIaoei2nfzn2kxhGqWzF6hFR5vmzX%2BTNHlWQsjRgxwjrGhgHLokgmPg%3D&rd=http%3A%2F%2Fstg-d.amoad.net%2Fclick%2F%3Fcid%3D9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c"
              },
              "assets": [{
                "req": false,
                "img": {
                  "url": "https://stg-i.amoad.net/creatives/146/7c2/58b/8a4cc590f744b43715270829182795646_original.jpg"
                },
                "id": 1
              }, {
                "req": false,
                "img": {
                  "url": "https://stg-i.amoad.net/creatives/f01/b93/31d/000.jpg"
                },
                "id": 2
              }, {
                "req": false,
                "title": {
                  "text": "ショートテキスト：じゃらん"
                },
                "id": 5
              }, {
                "req": false,
                "title": {
                  "text": "ロングテキスト：じゃらん"
                },
                "id": 4
              }, {
                "req": false,
                "title": {
                  "text": "サービス名：じゃらん"
                },
                "id": 3
              }, {
                "link": {
                  "clktrck": [],
                  "url": "http://stg-d.amoad.net/guideline/"
                },
                "req": false,
                "img": {
                  "url": "https://cdn.caprofitx.com/static/imark.png"
                },
                "id": 7
              }, {
                "req": false,
                "video": {
                  "vasttag": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><VAST version=\"2.0\"><Ad id=\"9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6cad\"><InLine><AdSystem>2.0</AdSystem><AdTitle>914360</AdTitle><Impression id=\"1stParty\"></Impression><Creatives><Creative><Linear><Duration>00:00:17.09</Duration><TrackingEvents><Tracking event=\"creativeView\"><![CDATA[https://stg-at.amoad.net/vcv/?cid=9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"start\"><![CDATA[https://stg-at.amoad.net/vs/?cid=9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"firstQuartile\"><![CDATA[https://stg-at.amoad.net/vfq/?cid=9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"midpoint\"><![CDATA[https://stg-at.amoad.net/vm/?cid=9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"thirdQuartile\"><![CDATA[https://stg-at.amoad.net/vtq/?cid=9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"complete\"><![CDATA[https://stg-at.amoad.net/vc/?cid=9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"progress\" offset=\"50%\"><![CDATA[https://stg-at.amoad.net/vp/?cid=9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"fullscreen\"><![CDATA[https://stg-at.amoad.net/vfs/?cid=9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c&vivr=${inview_ratio}&ssl=1]]></Tracking><Tracking event=\"closeLinear\"><![CDATA[https://stg-at.amoad.net/vcl/?cid=9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c&vivr=${inview_ratio}&ssl=1]]></Tracking></TrackingEvents><VideoClicks><ClickThrough id=\"1\"><![CDATA[http://stg-d.amoad.net/click/?cid=9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c]]></ClickThrough></VideoClicks><MediaFiles><MediaFile width=\"640\" height=\"360\" type=\"video/mp4\" delivery=\"progressive\"><![CDATA[https://stg-i.amoad.net/creatives/f01/b93/31d/video.mp4]]></MediaFile><MediaFile width=\"640\" height=\"360\" type=\"video/webm\" delivery=\"progressive\"><![CDATA[https://stg-i.amoad.net/creatives/f01/b93/31d/video.webm]]></MediaFile></MediaFiles></Linear></Creative></Creatives><Extensions><Extension service=\"amoad\" playType=\"banner\" isAutoRepeat=\"false\" repeatWait=\"5\" soundSetting=\"OFF\" volumeRatio=\"0.5\" enableInlineVideoPlayer=\"false\" autoPlay=\"true\" inviewRatio=\"0.5\" outviewRatio=\"0.9\"><ReplaceImage creativeType=\"image/jpeg\" width=\"640\" height=\"360\"><![CDATA[https://stg-i.amoad.net/creatives/f01/b93/31d/000.jpg]]></ReplaceImage><EndCard creativeType=\"image/jpeg\" width=\"640\" height=\"360\"><![CDATA[https://stg-i.amoad.net/creatives/a60/f62/cd4/882ed6a6f9df7eef15270829183318093_original.jpg]]></EndCard><LPURL id=\"lpurl\"><![CDATA[]]></LPURL></Extension></Extensions></InLine></Ad></VAST>"
                },
                "id": 12
              }, {
                "link": {
                  "clktrck": [],
                  "url": "http://stg-d.amoad.net/guideline/"
                },
                "req": false,
                "id": 8
              }],
              "ext": {
                "plcmtcnt": 2,
                "interval": 0,
                "viewableImptrackers": ["https://stg-ad.caprofitx.adtdp.com/v1/viewable_impression/2621d7f2-b229-4692-9feb-1b8796f9598e/?txidmap=JGIBD8bGfSdPIreqEGNlVdSt352m5ywYzz4DT%2BA6ChOfjam%2Bc37Yr5s4%2FnfDUOKVVP%2BrCG39e6tYAR7b74O13TS%2FBHwHRYmZlq3wOqMh1IDkqszAWrHDqIaoei2nfzn2kxhGqWzF6hFR5vmzX%2BTNHlWQsjRgxwjrGhgHLokgmPg%3D", "https://stg-v.amoad.net/vimp/?cid=9b17ec39228134cafd07e58b1b3f9077c2aa2ea3b200e40d549bf51bdd8f018154a974b4f8ff8fca885b4c7689742225f627e3c24171845a845a62c48f1974816d0a53bc1c473116a43219dff8f61a6c"],
                "adPositions": [1, 5, 8, 13, 21]
              }
            },
            "viewThroughUrls": ["https://stg-ad.caprofitx.adtdp.com/v1/view_through/2621d7f2-b229-4692-9feb-1b8796f9598e/?txidmap=JGIBD8bGfSdPIreqEGNlVdSt352m5ywYzz4DT%2BA6ChOfjam%2Bc37Yr5s4%2FnfDUOKVVP%2BrCG39e6tYAR7b74O13TS%2FBHwHRYmZlq3wOqMh1IDkqszAWrHDqIaoei2nfzn2kxhGqWzF6hFR5vmzX%2BTNHlWQsjRgxwjrGhgHLokgmPg%3D"],
            "bidderName": "afio",
            "expiresInSec": 1800
          },
          "cat": [],
          "impid": "1"
        }],
        "ext": {
          "pagePatterns": [],
          "pvId": "2621d7f2-b229-4692-9feb-1b8796f9598e",
          "pageId": 30107
        }
      });
      // (<any>window)[callbackName] = function(data: any) {
      //   resolve(data);
      // };
      // const script = Dom.createScriptElement();
      // script.async = true;
      // script.src = url;
      // document.body.appendChild(script);
    });
  }
}
