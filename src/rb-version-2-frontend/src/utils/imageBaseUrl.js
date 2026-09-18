/**
 * Plugin static image root — prefers WP-localized gemfindRBConfig over build-time VITE_IMAGE_URL.
 */
export function getImageBaseUrl() {
  if (typeof window !== "undefined" && window.gemfindRBConfig?.imageBaseUrl) {
    return String(window.gemfindRBConfig.imageBaseUrl).replace(/\/$/, "");
  }
  const fallback = import.meta.env.VITE_IMAGE_URL || "";
  return String(fallback).replace(/\/$/, "");
}
