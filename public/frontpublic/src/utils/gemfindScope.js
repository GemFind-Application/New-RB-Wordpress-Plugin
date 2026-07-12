/** Top-level storefront scope — keeps plugin UI isolated from theme/plugin CSS. */
export const GEMFIND_SCOPE_ID = "GemFind";
export const GEMFIND_SCOPE_CLASS = "gemfind-ring-builder-scope";
/** Portal mount on document.body (Shopify app parity). */
export const GEMFIND_PORTALS_ID = "portals";

export function getGemFindScopeEl() {
  if (typeof document === "undefined") {
    return null;
  }
  return (
    document.getElementById(GEMFIND_SCOPE_ID) ||
    document.getElementById("gemfindrb-root")
  );
}

export function getGemFindThemeTarget() {
  return getGemFindScopeEl() || document.documentElement;
}
