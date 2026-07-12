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

export function getGemFindPortalRoot() {
  if (typeof document === "undefined") {
    return null;
  }
  return document.getElementById(GEMFIND_PORTALS_ID);
}

/** Theme vars must be set on #GemFind and #portals — popups render outside the scope root. */
export function getGemFindThemeTargets() {
  const targets = [];
  const scopeRoot = getGemFindThemeTarget();
  if (scopeRoot) {
    targets.push(scopeRoot);
  }
  const portalRoot = getGemFindPortalRoot();
  if (portalRoot && !targets.includes(portalRoot)) {
    targets.push(portalRoot);
  }
  return targets.length ? targets : [document.documentElement];
}

export function copyGemFindThemeVariables(source, target) {
  if (!source || !target || source === target) {
    return;
  }
  const { style } = source;
  for (let i = 0; i < style.length; i += 1) {
    const name = style[i];
    if (name.startsWith("--")) {
      target.style.setProperty(name, style.getPropertyValue(name));
    }
  }
}

/** Copy inline theme custom properties from #GemFind to #portals (e.g. after portal mount). */
export function syncGemFindThemeToPortals() {
  const source = getGemFindScopeEl() || getGemFindThemeTarget();
  const portalRoot = getGemFindPortalRoot();
  if (source && portalRoot) {
    copyGemFindThemeVariables(source, portalRoot);
  }
}
