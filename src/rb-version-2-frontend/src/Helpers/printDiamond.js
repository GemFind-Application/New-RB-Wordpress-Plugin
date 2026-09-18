/**
 * Build print-PDF URL for WordPress REST or legacy Laravel /api routes.
 */
export function buildPrintDiamondUrl(shopUrl, diamondId, diamondType) {
  const cfg = typeof window !== "undefined" ? window.gemfindRBConfig : null;
  let restBase = (
    cfg?.restUrl ||
    import.meta.env.VITE_APP_FORM_API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  ).replace(/\/$/, "");

  const shop = encodeURIComponent(String(shopUrl ?? ""));
  const id = encodeURIComponent(String(diamondId ?? ""));
  const type = encodeURIComponent(String(diamondType ?? "mined"));

  if (restBase.includes("/wp-json/") || restBase.includes("gemfind-ring-builder")) {
    return `${restBase}/printDiamond/${shop}/${id}/${type}`;
  }

  if (restBase.endsWith("/api/ringbuilder")) {
    restBase = restBase.replace("/api/ringbuilder", "");
  } else if (restBase.endsWith("/api")) {
    restBase = restBase.replace("/api", "");
  }

  return `${restBase}/api/printDiamond/${shop}/${id}/${type}`;
}

/**
 * Build grading-report PDF download URL (proxied through WordPress).
 */
export function buildCertificatePdfUrl(shopUrl, diamondId, diamondType, options = {}) {
  const cfg = typeof window !== "undefined" ? window.gemfindRBConfig : null;
  let restBase = (
    cfg?.restUrl ||
    import.meta.env.VITE_APP_FORM_API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  ).replace(/\/$/, "");

  const shopKey =
    shopUrl ||
    cfg?.shop ||
    (typeof window !== "undefined" ? window.location.hostname : "");
  const shop = encodeURIComponent(String(shopKey ?? ""));
  const id = encodeURIComponent(String(diamondId ?? ""));
  const type = encodeURIComponent(String(diamondType ?? "mined"));

  const params = new URLSearchParams();
  if (options.certificateUrl) {
    params.set("certificate_url", String(options.certificateUrl));
  }
  const query = params.toString();
  const suffix = query ? `?${query}` : "";

  if (restBase.includes("/wp-json/") || restBase.includes("gemfind-ring-builder")) {
    return `${restBase}/certificatePdf/${shop}/${id}/${type}${suffix}`;
  }

  if (restBase.endsWith("/api/ringbuilder")) {
    restBase = restBase.replace("/api/ringbuilder", "");
  } else if (restBase.endsWith("/api")) {
    restBase = restBase.replace("/api", "");
  }

  return `${restBase}/api/certificatePdf/${shop}/${id}/${type}${suffix}`;
}

/**
 * Build complete-ring print PDF URL (setting + diamond).
 */
export function buildPrintCompleteRingUrl(shopUrl, settingId, diamondId, diamondType, options = {}) {
  const cfg = typeof window !== "undefined" ? window.gemfindRBConfig : null;
  let restBase = (
    cfg?.restUrl ||
    import.meta.env.VITE_APP_FORM_API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  ).replace(/\/$/, "");

  const shop = encodeURIComponent(String(shopUrl ?? ""));
  const setting = encodeURIComponent(String(settingId ?? ""));
  const id = encodeURIComponent(String(diamondId ?? ""));
  const type = encodeURIComponent(String(diamondType ?? "mined"));

  const params = new URLSearchParams();
  if (options.isLabSettings !== undefined && options.isLabSettings !== null && options.isLabSettings !== "") {
    params.set("is_lab_settings", String(options.isLabSettings));
  }
  if (options.ringSize) params.set("ring_size", String(options.ringSize));
  if (options.metalType) params.set("metal_type", String(options.metalType));
  if (options.sideStoneQuality) params.set("side_stone_quality", String(options.sideStoneQuality));
  if (options.centerStoneMin) params.set("center_stone_min", String(options.centerStoneMin));
  if (options.centerStoneMax) params.set("center_stone_max", String(options.centerStoneMax));
  if (options.styleNumber) params.set("style_number", String(options.styleNumber));

  const query = params.toString();
  const suffix = query ? `?${query}` : "";

  if (restBase.includes("/wp-json/") || restBase.includes("gemfind-ring-builder")) {
    return `${restBase}/printCompleteRing/${shop}/${setting}/${id}/${type}${suffix}`;
  }

  if (restBase.endsWith("/api/ringbuilder")) {
    restBase = restBase.replace("/api/ringbuilder", "");
  } else if (restBase.endsWith("/api")) {
    restBase = restBase.replace("/api", "");
  }

  return `${restBase}/api/printCompleteRing/${shop}/${setting}/${id}/${type}${suffix}`;
}

export function printDiamondRequestHeaders() {
  const headers = { Accept: "application/pdf" };
  const cfg = typeof window !== "undefined" ? window.gemfindRBConfig : null;
  if (cfg?.nonce) {
    headers["X-WP-Nonce"] = cfg.nonce;
  }
  return headers;
}

async function downloadPdfFromUrl(url, filename) {
  const response = await fetch(url, {
    method: "GET",
    headers: printDiamondRequestHeaders(),
    credentials: "same-origin",
  });

  if (!response.ok) {
    let message = `Download failed: ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody?.message) {
        message = errBody.message;
      }
    } catch {
      // Non-JSON error body.
    }
    throw new Error(message);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const errBody = await response.json();
    throw new Error(errBody?.message || "Download failed.");
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
}

/**
 * Fetch the diamond PDF and trigger a direct file download (no preview / print dialog).
 */
export async function downloadDiamondPdf(shopUrl, diamondId, diamondType, options = {}) {
  const url = buildPrintDiamondUrl(shopUrl, diamondId, diamondType);
  const filename =
    options.filename || `Diamond-${diamondId ? String(diamondId) : "Detail"}.pdf`;
  await downloadPdfFromUrl(url, filename);
}

/**
 * Fetch the diamond grading certificate PDF and trigger a direct file download.
 */
export async function downloadCertificatePdf(shopUrl, diamondId, diamondType, options = {}) {
  const url = buildCertificatePdfUrl(shopUrl, diamondId, diamondType, options);
  const filename =
    options.filename || `Certificate-${diamondId ? String(diamondId) : "Report"}.pdf`;
  await downloadPdfFromUrl(url, filename);
}

/**
 * Fetch the complete ring PDF (setting + diamond) and download directly.
 */
export async function downloadCompleteRingPdf(
  shopUrl,
  settingId,
  diamondId,
  diamondType,
  options = {}
) {
  const url = buildPrintCompleteRingUrl(shopUrl, settingId, diamondId, diamondType, options);
  const filename =
    options.filename ||
    `Complete-Ring-${settingId ? String(settingId) : "Setting"}${diamondId ? `-${diamondId}` : ""}.pdf`;
  await downloadPdfFromUrl(url, filename);
}
