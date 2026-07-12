/** Matches Diamond Link admin badge (frontend experience, not plugin version). */
export function formatFrontendExperienceBadge(toolVersion) {
  const raw = toolVersion != null && String(toolVersion).trim() !== "" ? String(toolVersion).trim() : "2.0";
  const t = raw.toLowerCase();
  if (t.startsWith("1") || t === "version-one") return "v1.0";
  if (t.startsWith("2") || t === "version-two") return "v2.0";
  const c = raw.replace(/^[vV]/, "");
  return c.startsWith("v") ? c : `v${c}`;
}

export function readToolVersionFromConfig(config) {
  const settings = config?.settings;
  if (!settings || typeof settings !== "object") return "2.0";
  return settings.tool_version ?? settings.toolversion ?? "2.0";
}
