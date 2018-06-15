import { Dom } from "./Dom";
export namespace Jsonp {
  export function fetch(url: string, callbackName: string): Promise<any> {
    return new Promise(resolve => {
      (<any>window)[callbackName] = function(data: any) {
        resolve(data);
      };
      const script = Dom.createScriptElement();
      script.async = true;
      script.src = url;
      document.body.appendChild(script);
    });
  }
}
