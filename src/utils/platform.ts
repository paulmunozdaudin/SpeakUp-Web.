/** iPadOS 13+ reports its userAgent as a regular Mac but exposes touch
 *  points a real Mac never has — the standard way to tell them apart. */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const isAppleTouchDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIPadOS13Plus =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isAppleTouchDevice || isIPadOS13Plus;
}
