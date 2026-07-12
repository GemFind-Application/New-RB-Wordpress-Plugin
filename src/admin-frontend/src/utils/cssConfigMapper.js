import {
  CSS_THEMES,
  DEFAULT_THEME_COLORS,
  FALLBACK_DB_COLORS,
  COLOR_FIELDS,
  NAV_COLOR_FIELDS,
} from "../data/cssThemes";

const THEME_TO_ADMIN = {
  linkColor: "link_color",
  hoverEffect: "hover_effect",
  columnHeaderAccent: "column_header_accent",
  callToActionButton: "call_to_action_button",
  slider_barmakian: "slider_effect",
  background: "background",
  backgroundText: "background_text_color",
  navActiveBackgroundColor: "nav_active_background_color",
  navInactiveBackgroundColor: "nav_inactive_background_color",
  navActiveTextColor: "nav_active_text_color",
  navInactiveTextColor: "nav_inactive_text_color",
};

export function themeColorsToAdmin(themeColors) {
  const out = {};
  Object.entries(THEME_TO_ADMIN).forEach(([themeKey, adminKey]) => {
    out[adminKey] = themeColors[themeKey] || "#000000";
  });
  return out;
}

export function dbRowToAdminColors(row = {}) {
  return {
    link_color: row.link_color || row.link || "#000000",
    hover_effect: row.hover_effect || row.hover || "#CCCCCC",
    column_header_accent: row.column_header_accent || row.header || "#333333",
    call_to_action_button: row.call_to_action_button || row.button || "#FF5722",
    slider_effect: row.slider_effect || row.slider || "#4CAF50",
    background: row.background || "#262523",
    background_text_color: row.background_text_color || row.backgroundText || "#262523",
    nav_active_background_color:
      row.nav_active_background_color || DEFAULT_THEME_COLORS.navActiveBackgroundColor,
    nav_inactive_background_color:
      row.nav_inactive_background_color || DEFAULT_THEME_COLORS.navInactiveBackgroundColor,
    nav_active_text_color: row.nav_active_text_color || DEFAULT_THEME_COLORS.navActiveTextColor,
    nav_inactive_text_color: row.nav_inactive_text_color || DEFAULT_THEME_COLORS.navInactiveTextColor,
  };
}

export function adminColorsToDb(colors) {
  return {
    link: colors.link_color,
    hover: colors.hover_effect,
    header: colors.column_header_accent,
    button: colors.call_to_action_button,
    slider: colors.slider_effect,
    background: colors.background,
    backgroundText: colors.background_text_color,
    nav_active_background_color: colors.nav_active_background_color,
    nav_inactive_background_color: colors.nav_inactive_background_color,
    nav_active_text_color: colors.nav_active_text_color,
    nav_inactive_text_color: colors.nav_inactive_text_color,
  };
}

export function getThemeColorForType(themeColors, adminKey) {
  const field = [...COLOR_FIELDS, ...NAV_COLOR_FIELDS].find((f) => f.key === adminKey);
  if (!field) return "#000000";
  return themeColors[field.themeKey] || "#000000";
}

export function isThemeUnmodified(selectedTheme, colors) {
  if (selectedTheme === "custom") return false;
  if (selectedTheme === "default") {
    const d = DEFAULT_THEME_COLORS;
    return (
      colors.link_color === d.linkColor &&
      colors.hover_effect === d.hoverEffect &&
      colors.column_header_accent === d.columnHeaderAccent &&
      colors.call_to_action_button === d.callToActionButton &&
      colors.slider_effect === d.slider_barmakian &&
      colors.background === d.background &&
      colors.background_text_color === d.backgroundText &&
      colors.nav_active_background_color === d.navActiveBackgroundColor &&
      colors.nav_inactive_background_color === d.navInactiveBackgroundColor &&
      colors.nav_active_text_color === d.navActiveTextColor &&
      colors.nav_inactive_text_color === d.navInactiveTextColor
    );
  }
  const themeColors = CSS_THEMES[selectedTheme]?.colors;
  if (!themeColors) return false;
  return (
    colors.link_color === themeColors.linkColor &&
    colors.hover_effect === themeColors.hoverEffect &&
    colors.column_header_accent === themeColors.columnHeaderAccent &&
    colors.call_to_action_button === themeColors.callToActionButton &&
    colors.slider_effect === themeColors.slider_barmakian &&
    colors.background === themeColors.background &&
    colors.background_text_color === themeColors.backgroundText &&
    colors.nav_active_background_color === themeColors.navActiveBackgroundColor &&
    colors.nav_inactive_background_color === themeColors.navInactiveBackgroundColor &&
    colors.nav_active_text_color === themeColors.navActiveTextColor &&
    colors.nav_inactive_text_color === themeColors.navInactiveTextColor
  );
}

/** Resolve initial theme + colors from DB row (Shopify v2 logic). */
export function resolveInitialState(row = {}) {
  const customColors = dbRowToAdminColors(row);
  const selectedThemeFromDB = row.selected_theme || "default";
  const isDefaultView = String(row.set_default_view ?? "1") === "1";
  const isPredefinedTheme =
    selectedThemeFromDB &&
    selectedThemeFromDB !== "unset" &&
    selectedThemeFromDB !== "custom" &&
    selectedThemeFromDB !== "default" &&
    CSS_THEMES[selectedThemeFromDB];

  if (isDefaultView) {
    return {
      selectedTheme: "default",
      colors: themeColorsToAdmin(DEFAULT_THEME_COLORS),
      customColors,
    };
  }
  if (isPredefinedTheme) {
    return {
      selectedTheme: selectedThemeFromDB,
      colors: themeColorsToAdmin(CSS_THEMES[selectedThemeFromDB].colors),
      customColors,
    };
  }
  return {
    selectedTheme: "custom",
    colors: customColors,
    customColors,
  };
}

/** Build DB save payload — mirrors Shopify css-configuration.jsx save logic. */
export function buildCssSavePayload(selectedTheme, colors, customColors) {
  const isUnmodified = isThemeUnmodified(selectedTheme, colors);
  const colorsToUse = customColors || FALLBACK_DB_COLORS;
  const dbBase = adminColorsToDb(colors);

  if (selectedTheme === "custom") {
    return {
      ...dbBase,
      selected_theme: "unset",
      set_default_view: "0",
    };
  }

  if (selectedTheme === "default") {
    if (isUnmodified) {
      return {
        link: colorsToUse.link_color || colorsToUse.link,
        hover: colorsToUse.hover_effect || colorsToUse.hover,
        header: colorsToUse.column_header_accent || colorsToUse.header,
        button: colorsToUse.call_to_action_button || colorsToUse.button,
        slider: colorsToUse.slider_effect || colorsToUse.slider,
        background: colorsToUse.background,
        backgroundText: colorsToUse.background_text_color || colorsToUse.backgroundText,
        nav_active_background_color:
          colorsToUse.nav_active_background_color || FALLBACK_DB_COLORS.nav_active_background_color,
        nav_inactive_background_color:
          colorsToUse.nav_inactive_background_color || FALLBACK_DB_COLORS.nav_inactive_background_color,
        nav_active_text_color:
          colorsToUse.nav_active_text_color || FALLBACK_DB_COLORS.nav_active_text_color,
        nav_inactive_text_color:
          colorsToUse.nav_inactive_text_color || FALLBACK_DB_COLORS.nav_inactive_text_color,
        selected_theme: "default",
        set_default_view: "1",
      };
    }
    return {
      ...dbBase,
      selected_theme: "default",
      set_default_view: "0",
    };
  }

  if (isUnmodified) {
    return {
      link: colorsToUse.link_color,
      hover: colorsToUse.hover_effect,
      header: colorsToUse.column_header_accent,
      button: colorsToUse.call_to_action_button,
      slider: colorsToUse.slider_effect,
      background: colorsToUse.background,
      backgroundText: colorsToUse.background_text_color,
      nav_active_background_color: colorsToUse.nav_active_background_color,
      nav_inactive_background_color: colorsToUse.nav_inactive_background_color,
      nav_active_text_color: colorsToUse.nav_active_text_color,
      nav_inactive_text_color: colorsToUse.nav_inactive_text_color,
      selected_theme: selectedTheme,
      set_default_view: "0",
    };
  }

  return {
    ...dbBase,
    selected_theme: selectedTheme,
    set_default_view: "0",
  };
}
