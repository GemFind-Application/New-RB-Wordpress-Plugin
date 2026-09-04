import React, { useEffect, useState, useRef } from "react";
import AdminShell, { useAdminShell } from "../components/AdminShell";
import AdminToast from "../components/AdminToast";
import { Field, Toggle, Select } from "../components/Field";
import { apiGet, apiPost } from "../api";
import { useAdminNotice } from "../hooks/useAdminNotice";
import {
  FONT_FAMILY_OPTIONS,
  isOtherFontFamily,
  normalizeFontFamilyFields,
} from "../utils/fontFamilyUtils";

const TOOL_VERSION_OPTIONS = [
  { label: "Version 2 — modern UI (default)", value: "2.0" },
  { label: "Version 1 — classic / table UI", value: "1.0" },
];

const TABS = [
  { id: "general", label: "General" },
  { id: "display", label: "Display" },
  { id: "email", label: "Email / Notifications" },
  { id: "seo", label: "SEO / Meta" },
  { id: "advanced", label: "Advanced" },
];

const RECAPTCHA_VERSION_OPTIONS = [
  { value: "v2", label: "reCAPTCHA v2 (checkbox)" },
  { value: "v3", label: "reCAPTCHA v3 (badge / invisible)" },
];

const PER_PAGE_OPTIONS = [12, 24, 48, 99].map((n) => ({
  value: String(n),
  label: `Records Per Page: ${n}`,
}));

const DEFAULT_VIEW_OPTIONS = [
  { value: "list", label: "List View" },
  { value: "grid", label: "Grid View" },
];

const CURRENCY_OPTIONS = [
  { value: "right", label: "Right" },
  { value: "left", label: "Left" },
];

const FEATURE_TOGGLES = [
  { key: "enable_hint", label: "Drop-a-Hint" },
  { key: "enable_email_friend", label: "Email a Friend" },
  { key: "enable_schedule_viewing", label: "Schedule Viewing" },
  { key: "enable_more_info", label: "Request More Info" },
  { key: "enable_print", label: "Print Diamond" },
  { key: "enable_admin_notification", label: "Admin Email Notification" },
  { key: "enable_sticky_header", label: "Sticky Header" },
  { key: "show_powered_by", label: "Show 'Powered by GemFind' on the storefront (opt-in)" },
  { key: "show_filter_info", label: "Show Filter Info" },
  { key: "display_tryon", label: "Enable Virtual Try-On" },
  { key: "buySingleDiamond", label: "Buy Single Diamond" },
  { key: "show_copyright", label: "Show Copyright Notice" },
];

function boolVal(v) {
  return v === 1 || v === "1" || v === true;
}

function normalizeToolVersion(value) {
  const v = String(value || "2.0").toLowerCase();
  if (v === "version-one" || v === "1" || v.startsWith("1.")) return "1.0";
  return "2.0";
}

function normalizeRecaptchaVersion(value) {
  return String(value || "v2").toLowerCase() === "v3" ? "v3" : "v2";
}

export default function SettingsPage() {
  const { setExperienceBadge } = useAdminShell();
  const cfg = window.gemfindRBAdminConfig || {};
  const cssAdminUrl = `${(cfg.adminUrl || "").replace(/\/?$/, "")}/admin.php?page=ringbuilder-css`;

  const [tab, setTab] = useState("general");
  const [form, setForm] = useState(() => ({
    ...(cfg.settings || {}),
    ...normalizeFontFamilyFields(cfg.settings || {}),
  }));
  const { notice, showSuccess, showError } = useAdminNotice();
  const [loading, setLoading] = useState(false);
  const previousToolVersionRef = useRef(null);
  const [showVersionSwitchModal, setShowVersionSwitchModal] = useState(false);
  const [pendingToolVersion, setPendingToolVersion] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("/shop/configuration", { shop: cfg.shop });
        if (res?.data) {
          const merged = {
            ...res.data,
            tool_version: normalizeToolVersion(res.data.tool_version),
            recaptcha_version: normalizeRecaptchaVersion(res.data.recaptcha_version),
            default_view: res.data.default_view || res.data.default_viewmode || "list",
            ...normalizeFontFamilyFields(res.data),
          };
          setForm(merged);
          previousToolVersionRef.current = merged.tool_version;
        }
      } catch (e) {
        showError(String(e.message || e));
      }
    })();
  }, [cfg.shop]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "tool_version") {
      const previousValue = previousToolVersionRef.current || normalizeToolVersion(form.tool_version);
      const nextValue = normalizeToolVersion(value);
      if (previousValue === "1.0" && nextValue === "2.0") {
        setPendingToolVersion(nextValue);
        setShowVersionSwitchModal(true);
        return;
      }
      previousToolVersionRef.current = nextValue;
      setForm((f) => ({ ...f, tool_version: nextValue }));
      setExperienceBadge(nextValue);
      return;
    }

    setForm((f) => ({ ...f, [name]: type === "checkbox" ? (checked ? "1" : "0") : value }));
  };

  const handleVersionSwitchConfirm = () => {
    if (pendingToolVersion) {
      setForm((prev) => ({ ...prev, tool_version: pendingToolVersion }));
      previousToolVersionRef.current = pendingToolVersion;
      setPendingToolVersion(null);
      setExperienceBadge(pendingToolVersion);
    }
    setShowVersionSwitchModal(false);
  };

  const handleVersionSwitchCancel = () => {
    if (previousToolVersionRef.current) {
      setForm((prev) => ({ ...prev, tool_version: previousToolVersionRef.current }));
    }
    setPendingToolVersion(null);
    setShowVersionSwitchModal(false);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost("/shop/configuration", { ...form, shop: cfg.shop });
      showSuccess("Settings saved successfully!");
    } catch (ex) {
      showError(String(ex.message || ex) || "Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell>
      <AdminToast notice={notice} />
      <div className="wpdl-settings-page">
        <form onSubmit={onSave}>
          <nav className="wpdl-tabs" aria-label="Settings sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`wpdl-tab${tab === t.id ? " active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === "general" && (
            <div className="wpdl-tab-section">
              <h2>General Settings</h2>
              <Field
                label="JewelCloud Account ID (Dealer ID)"
                help="Required. Your JewelCloud dealer ID."
              >
                <input className="wpdl-input" name="dealerid" value={form.dealerid || ""} onChange={onChange} />
              </Field>
              <Field label="Frontend experience" help="">
                <Select
                  name="tool_version"
                  value={normalizeToolVersion(form.tool_version)}
                  onChange={onChange}
                  options={TOOL_VERSION_OPTIONS}
                />
              </Field>
              <Field label="Set Mountings Per Page">
                <Select
                  name="products_pp"
                  value={String(form.products_pp || "12")}
                  onChange={onChange}
                  options={PER_PAGE_OPTIONS}
                />
              </Field>
              <Field label="Mounting Listing Default View">
                <Select
                  name="default_view"
                  value={form.default_view || "list"}
                  onChange={onChange}
                  options={DEFAULT_VIEW_OPTIONS}
                />
              </Field>
              <Field
                label="Carat Ranges"
                help="Comma-separated values, e.g. 0.1,0.5,1,1.5,2,3,4,5"
              >
                <input
                  className="wpdl-input"
                  name="settings_carat_ranges"
                  value={form.settings_carat_ranges || ""}
                  onChange={onChange}
                />
              </Field>
              <Field label="Shop Title">
                <input className="wpdl-input" name="shop_title" value={form.shop_title || ""} onChange={onChange} />
              </Field>
              <Field label="Phone Number">
                <input className="wpdl-input" name="phone_number" value={form.phone_number || ""} onChange={onChange} />
              </Field>
            </div>
          )}

          {tab === "display" && (
            <div className="wpdl-tab-section">
              <h2>Display Options</h2>
              <Field label="Features">
                <div className="wpdl-toggles-grid">
                  {FEATURE_TOGGLES.map((b) => (
                    <Toggle
                      key={b.key}
                      name={b.key}
                      label={b.label}
                      checked={boolVal(form[b.key])}
                      onChange={onChange}
                    />
                  ))}
                </div>
              </Field>
              <Field
                label="Currency Symbol Position"
                help="Whether the currency symbol appears on the right or left of prices in listings, cards, and filters."
              >
                <Select
                  name="price_row_format"
                  value={form.price_row_format === "right" ? "right" : "left"}
                  onChange={onChange}
                  options={CURRENCY_OPTIONS}
                />
              </Field>
              <Field label="Font Family">
                <Select
                  name="font_family"
                  value={form.font_family || "Helvetica"}
                  onChange={onChange}
                  options={FONT_FAMILY_OPTIONS}
                />
              </Field>
              {isOtherFontFamily(form.font_family) && (
                <Field label="Theme Font Family">
                  <input
                    className="wpdl-input"
                    name="theme_font_family"
                    value={form.theme_font_family || ""}
                    onChange={onChange}
                    placeholder="Enter custom font family"
                  />
                </Field>
              )}
              <Field
                label="Shop Logo URL"
                help="Direct URL to your logo image. It is shown in the header of every Ring Builder email (drop a hint, email a friend, request info, schedule viewing). Leave blank to send emails without a logo."
              >
                <input
                  className="wpdl-input"
                  name="shop_logo"
                  value={form.shop_logo || ""}
                  onChange={onChange}
                  placeholder="https://example.com/logo.png"
                />
              </Field>
              <Field label="Announcement Text (List Page)">
                <textarea
                  className="wpdl-textarea"
                  name="announcement_text"
                  rows={3}
                  value={form.announcement_text || ""}
                  onChange={onChange}
                />
              </Field>
              <Field label="Announcement Text (Detail Page)">
                <textarea
                  className="wpdl-textarea"
                  name="announcement_text_rbdetail"
                  rows={3}
                  value={form.announcement_text_rbdetail || ""}
                  onChange={onChange}
                />
              </Field>
            </div>
          )}

          {tab === "email" && (
            <div className="wpdl-tab-section">
              <h2>Email &amp; Notifications</h2>
              <Field
                label="Admin Email Address(es)"
                help="Notification recipients for storefront forms (comma-separated). Leave blank to use the WordPress site admin email. Form data is not sent to GemFind unless you add that address here."
              >
                <input
                  className="wpdl-input"
                  type="text"
                  name="admin_email_address"
                  value={form.admin_email_address || ""}
                  onChange={onChange}
                  placeholder="store-owner@example.com"
                />
              </Field>
              <Field
                label="From Email Address"
                help="Address shown in the From header. Falls back to the first Admin Email, then the site admin email."
              >
                <input
                  className="wpdl-input"
                  type="email"
                  name="from_email_address"
                  value={form.from_email_address || ""}
                  onChange={onChange}
                  placeholder="store-owner@example.com"
                />
              </Field>
            </div>
          )}

          {tab === "seo" && (
            <div className="wpdl-tab-section">
              <h2>SEO &amp; Meta Tags</h2>
              <Field label="Mountings Search - Meta Title">
                <input className="wpdl-input" name="ring_meta_title" value={form.ring_meta_title || ""} onChange={onChange} />
              </Field>
              <Field label="Mountings Search - Meta Description">
                <textarea
                  className="wpdl-textarea"
                  name="ring_meta_description"
                  value={form.ring_meta_description || ""}
                  onChange={onChange}
                />
              </Field>
              <Field label="Mountings Search - Meta Keywords">
                <input
                  className="wpdl-input"
                  name="ring_meta_keywords"
                  value={form.ring_meta_keywords || ""}
                  onChange={onChange}
                />
              </Field>
              <Field label="Diamond Search - Meta Title">
                <input
                  className="wpdl-input"
                  name="diamond_meta_title"
                  value={form.diamond_meta_title || ""}
                  onChange={onChange}
                />
              </Field>
              <Field label="Diamond Search - Meta Description">
                <textarea
                  className="wpdl-textarea"
                  name="diamond_meta_description"
                  value={form.diamond_meta_description || ""}
                  onChange={onChange}
                />
              </Field>
              <Field label="Diamond Search - Meta Keywords">
                <input
                  className="wpdl-input"
                  name="diamond_meta_keyword"
                  value={form.diamond_meta_keyword || ""}
                  onChange={onChange}
                />
              </Field>
              <Field label="Diamond Detail Custom HTML">
                <textarea
                  className="wpdl-textarea"
                  name="diamond_details_textarea"
                  value={form.diamond_details_textarea || ""}
                  onChange={onChange}
                />
              </Field>
            </div>
          )}

          {tab === "advanced" && (
            <div className="wpdl-tab-section">
              <h2>Advanced Settings</h2>
              <Field
                label="Google reCAPTCHA Version"
                help="Use v2 to show a checkbox on each form. Use v3 for site-wide protection (badge) and token validation on form submit."
              >
                <Select
                  name="recaptcha_version"
                  value={normalizeRecaptchaVersion(form.recaptcha_version)}
                  onChange={onChange}
                  options={RECAPTCHA_VERSION_OPTIONS}
                />
              </Field>
              <Field label="Google reCAPTCHA Site Key">
                <input className="wpdl-input" name="site_key" value={form.site_key || ""} onChange={onChange} />
              </Field>
              <Field label="Google reCAPTCHA Secret Key">
                <input
                  className="wpdl-input"
                  type="password"
                  name="secret_key"
                  value={form.secret_key || ""}
                  onChange={onChange}
                  autoComplete="new-password"
                />
              </Field>
            </div>
          )}

          <div className="wpdl-form-footer">
            <button type="submit" className="wpdl-btn wpdl-btn--primary" disabled={loading}>
              {loading ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </form>

        {showVersionSwitchModal && (
          <div
            className="wpdl-modal-overlay"
            role="presentation"
            onClick={(e) => e.target === e.currentTarget && handleVersionSwitchCancel()}
          >
            <div className="wpdl-modal" role="dialog" aria-modal="true" aria-labelledby="wpdl-v12-modal-title">
              <div className="wpdl-modal__header">
                <h2 id="wpdl-v12-modal-title" className="wpdl-modal__title">
                  Important: Version 1 colour settings
                </h2>
                <button
                  type="button"
                  className="wpdl-modal__close"
                  onClick={handleVersionSwitchCancel}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="wpdl-modal__body">
                <p style={{ margin: "0 0 12px" }}>
                  Before switching to <strong>Version 2 (modern UI)</strong>, make sure any colour choices from{" "}
                  <strong>Version 1</strong> are saved or noted. Version 2 uses the expanded CSS Configurator
                  (including preset themes).
                </p>
                <p style={{ margin: 0 }}>
                  Review colours under{" "}
                  <a href={cssAdminUrl} target="_blank" rel="noopener noreferrer">
                    CSS Configurator
                  </a>
                  , then click <strong>Proceed</strong> to change the frontend experience, or <strong>Cancel</strong>{" "}
                  to stay on Version 1.
                </p>
              </div>
              <div className="wpdl-modal__footer">
                <button type="button" className="wpdl-btn wpdl-btn--outline" onClick={handleVersionSwitchCancel}>
                  Cancel
                </button>
                <button type="button" className="wpdl-btn wpdl-btn--primary" onClick={handleVersionSwitchConfirm}>
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
