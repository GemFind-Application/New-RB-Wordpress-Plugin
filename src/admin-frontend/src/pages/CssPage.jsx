import React, { useEffect, useState, useRef } from "react";
import AdminShell from "../components/AdminShell";
import AdminToast from "../components/AdminToast";
import ColorCard from "../components/ColorCard";
import { apiGet, apiPost } from "../api";
import { useAdminNotice } from "../hooks/useAdminNotice";
import {
  CSS_THEMES,
  COLOR_FIELDS,
  NAV_COLOR_FIELDS,
  V1_COLOR_FIELDS,
} from "../data/cssThemes";
import {
  buildCssSavePayload,
  dbRowToAdminColors,
  getThemeColorForType,
  resolveInitialState,
  themeColorsToAdmin,
} from "../utils/cssConfigMapper";

export default function CssPage() {
  const cfg = window.gemfindRBAdminConfig || {};
  const isVersionOne = cfg.cssConfiguratorExperience === "v1";
  const pluginUrl = (cfg.pluginUrl || "").replace(/\/+$/, "");
  const spinnerUrl = pluginUrl ? `${pluginUrl}/assets/images/wpdl2/loading-spinner.svg` : "";

  const [colors, setColors] = useState(() => dbRowToAdminColors(cfg.cssConfig));
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [customColors, setCustomColors] = useState(null);
  const { notice, showSuccess, showError } = useAdminNotice();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const customColorsRef = useRef(null);

  const visibleFields = isVersionOne ? V1_COLOR_FIELDS : [...COLOR_FIELDS, ...NAV_COLOR_FIELDS];

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("/css/configuration", { shop: cfg.shop });
        const row = res?.data || {};
        const stored = dbRowToAdminColors(row);
        customColorsRef.current = stored;
        setCustomColors(stored);
        if (isVersionOne) {
          setSelectedTheme("default");
          setColors(stored);
        } else {
          const initial = resolveInitialState(row);
          setSelectedTheme(initial.selectedTheme);
          setColors(initial.colors);
        }
      } catch (e) {
        showError(String(e.message || e));
      } finally {
        setInitializing(false);
      }
    })();
  }, [cfg.shop, isVersionOne]);

  const applyTheme = (themeKey) => {
    if (isVersionOne) return;
    setSelectedTheme(themeKey);
    if (themeKey === "custom" && customColorsRef.current) {
      setColors({ ...customColorsRef.current });
      return;
    }
    if (CSS_THEMES[themeKey]?.colors) {
      setColors(themeColorsToAdmin(CSS_THEMES[themeKey].colors));
    }
  };

  const handleColorChange = (colorKey) => (hexValue) => {
    setColors((prev) => ({ ...prev, [colorKey]: hexValue }));
    if (isVersionOne) return;
    let isModified = selectedTheme === "custom";
    if (!isModified && CSS_THEMES[selectedTheme]?.colors) {
      const themeColor = getThemeColorForType(CSS_THEMES[selectedTheme].colors, colorKey);
      isModified = hexValue.toUpperCase() !== themeColor.toUpperCase();
    }
    if (isModified && selectedTheme !== "custom") {
      setSelectedTheme("custom");
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const themeForSave = isVersionOne ? "default" : selectedTheme;
      const payload = buildCssSavePayload(themeForSave, colors, customColorsRef.current);
      await apiPost("/css/configuration", { ...payload, shop: cfg.shop });
      customColorsRef.current = dbRowToAdminColors(payload);
      setCustomColors(customColorsRef.current);
      showSuccess("CSS configuration updated successfully.");
    } catch (ex) {
      showError(String(ex.message || ex) || "Failed to save CSS configuration.");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <AdminShell>
        <div className="wpdl-loading">
          {spinnerUrl ? (
            <img className="wpdl-loading__spinner" src={spinnerUrl} alt="" />
          ) : (
            <span className="spinner" />
          )}
          Loading theme configuration…
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <AdminToast notice={notice} />
      <form onSubmit={onSave} className="wpdl-dynamic-css">
        <h2 className="wpdl-dynamic-css__title">Dynamic CSS Configuration</h2>
        <p className="wpdl-dynamic-css__lead">
          {isVersionOne
            ? "Version 1 uses three storefront colors: link, column header accent, and call-to-action button."
            : "Customize storefront colors for the ring builder. Choose a preset theme or fine-tune individual values."}
        </p>

        <div className="wpdl-dynamic-css__grid">
          {visibleFields.map(({ key, label }) => (
            <ColorCard
              key={key}
              label={label}
              value={colors[key] || "#000000"}
              onChange={handleColorChange(key)}
            />
          ))}
        </div>

        {!isVersionOne && (
          <div className="wpdl-dynamic-css__footer-row">
            <div className="wpdl-field">
              <label className="wpdl-field__label" htmlFor="wpdl-theme-select">
                Select Theme
              </label>
              <select
                id="wpdl-theme-select"
                className="wpdl-select"
                value={selectedTheme}
                onChange={(e) => applyTheme(e.target.value)}
              >
                {Object.entries(CSS_THEMES).map(([key, theme]) => (
                  <option key={key} value={key}>
                    {theme.name}
                  </option>
                ))}
              </select>
              <p className="wpdl-field__help">
                Picking a preset fills all color fields. Editing any color switches to Custom View.
              </p>
            </div>
          </div>
        )}

        <div className="wpdl-form-footer">
          <button type="submit" className="wpdl-btn wpdl-btn--primary" disabled={loading}>
            {loading ? "Saving…" : "Save Colors"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
