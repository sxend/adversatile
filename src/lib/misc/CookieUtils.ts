
/**
 * Cookie utility.
 */
export namespace CookieUtils {

  /**
   * Get item from cookie.
   *
   * @param key
   * @returns value of null.
   */
  export function getItem(key: string): string {
    if (!key || !hasItem(key)) {
      return null;
    }
    return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
  }

  /**
   * Set a item into cookie.
   *
   * @param key
   * @param value
   * @param expiration
   * @param path
   * @param domain
   * @param isSecure
   */
  export function setItem(key: string, value: string, expiration: Date, path: string = "/", domain: string = "", isSecure: boolean = false): void {
    if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key)) {
      return;
    }
    var expires = "; expires=" + expiration.toUTCString();
    document.cookie = escape(key) + "=" + escape(value) + expires + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "") + (isSecure ? "; secure" : "");
  }

  /**
   * Check existence key in cookie.
   *
   * @param key
   * @return It returns true when exists the key.
   */
  export function hasItem(key: string): boolean {
    return (new RegExp("(?:^|;\\s*)" + escape(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  }

  function unescape(srt: string): string {
    return decodeURIComponent(srt);
  }

  function escape(str: string): string {
    return encodeURIComponent(str);
  }
}
