export namespace MacroUtils {
  export function addExpandParams(url: string, expandParams: [{ name: string; value: string | number }]): string {
    if (!expandParams) {
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
  };
}