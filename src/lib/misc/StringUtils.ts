/* Nano Templates - https://github.com/trix/nano */
export function nano(template: string, data: any) {
  return template.replace(/\{\{([\w\.]*)\}\}/g, function(str, key) {
    try {
      const keys = key.split(".");
      let v = data[keys.shift()];
      for (let i = 0, l = keys.length; i < l; i++) {
        v = v[keys[i]];
      }
      return typeof v !== "undefined" && v !== null ? v : "";
    } catch (e) { }
    return str;
  });
}
