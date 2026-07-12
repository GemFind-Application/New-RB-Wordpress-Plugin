export const FONT_FAMILY_OPTIONS = [
  { value: "Helvetica", label: "Helvetica" },
  { value: "Helvetica Neue, Arial", label: "Helvetica Neue, Arial" },
  { value: "Lucida Grande, sans-serif", label: "Lucida Grande, sans-serif" },
  { value: "Arial", label: "Arial" },
  { value: "Verdana", label: "Verdana" },
  { value: "Other", label: "Other" },
];

const PRESET_VALUES = new Set(
  FONT_FAMILY_OPTIONS.filter((opt) => opt.value !== "Other").map((opt) => opt.value)
);

/** Normalize stored DB values into admin form shape (Shopify v2 parity). */
export function normalizeFontFamilyFields(data = {}) {
  const raw = String(data.font_family || "").trim();
  const theme = String(data.theme_font_family || "").trim();

  if (raw.toLowerCase() === "other") {
    return { font_family: "Other", theme_font_family: theme };
  }
  if (PRESET_VALUES.has(raw)) {
    return { font_family: raw, theme_font_family: theme };
  }
  if (raw) {
    return { font_family: "Other", theme_font_family: raw };
  }
  return { font_family: "Helvetica", theme_font_family: "" };
}

export function isOtherFontFamily(value) {
  return String(value || "").trim().toLowerCase() === "other";
}
