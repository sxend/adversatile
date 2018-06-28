import { Dom } from "./Dom";
export namespace Jsonp {
  export function fetch<A>(url: string, callbackName: string): Promise<A> {
    return new Promise(resolve => {
      (<any>window)[callbackName] = function(data: A) {
        resolve(data);
      };
      const script = Dom.createScriptElement();
      script.async = true;
      script.src = url;
      document.body.appendChild(script);
    });
  }
}
