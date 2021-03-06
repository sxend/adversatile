import { isEmptyArray } from "../../misc/TypeCheck";

export namespace RendererUtils {
  export function addExpandParams(
    url: string,
    expandParams: { name: string; value: string | number }[]
  ): string {
    if (!expandParams || isEmptyArray(expandParams)) {
      return url;
    }
    let params: string = url.match(/\?.*/) ? "&" : "?";
    for (let i = 0; i < expandParams.length; i++) {
      params += expandParams[i].name + "=" + expandParams[i].value;
      if (i + 1 < expandParams.length) {
        params += "&";
      }
    }
    return url + params;
  }
  export function insertTextAsset(element: HTMLElement, text: string) {
    if (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    element.appendChild(document.createTextNode(text));
  }
}
