/**
 * Font loading utility functions for Version 2
 */
import { getGemFindScopeEl, getGemFindThemeTargets } from './gemfindScope';

/**
 * List of system fonts that don't need to be loaded from Google Fonts
 */
const SYSTEM_FONTS = [
  'Arial', 'Helvetica', 'Helvetica Neue', 'Verdana', 'Times New Roman',
  'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
  'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Grande', 'Courier New',
  'Monaco', 'Menlo', 'Consolas'
];

/**
 * Loads a Google Font dynamically by creating a link element
 * @param {string} fontFamily - Font family name (may include font stack like ", sans-serif")
 */
const loadGoogleFont = (fontFamily) => {
  if (!fontFamily) return;

  // Extract just the font name (remove font stack and ALL quotes)
  // Handle cases like: "Lucida Grande', sans-serif" or "Manrope, sans-serif"
  let cleanFontName = fontFamily
    .split(',')[0] // Get only the font name (before comma)
    .replace(/['"]/g, '') // Remove ALL quotes (single and double)
    .trim();

  if (!cleanFontName) return;

  // Check if font is already loaded - use a safer method to avoid selector issues
  const allFontLinks = document.querySelectorAll('link[data-font]');
  const isAlreadyLoaded = Array.from(allFontLinks).some(link => 
    link.getAttribute('data-font') === cleanFontName
  );
  
  if (isAlreadyLoaded) {
    return; // Font already loaded
  }

  // Check if it's a system font
  const isSystemFont = SYSTEM_FONTS.some(sysFont => 
    cleanFontName.toLowerCase().includes(sysFont.toLowerCase())
  );

  if (isSystemFont) {
    return; // Don't load system fonts
  }

  // Create link element for Google Fonts
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFontName)}:wght@300;400;500;600;700;900&display=swap`;
  link.setAttribute('data-font', cleanFontName);
  document.head.appendChild(link);
};

/**
 * Applies font family to CSS custom properties and DOM elements
 * @param {string} fontFamily - Font family name to apply
 */
export const applyFontFamily = (fontFamily) => {
  if (!fontFamily) return;

  // Clean font family name but preserve font stack (e.g., ", sans-serif")
  // Remove ALL quotes from all parts, then reconstruct
  const parts = fontFamily.split(',').map(part => part.replace(/['"]/g, '').trim());
  const fontName = parts[0];
  const fontStack = parts.length > 1 ? parts.slice(1).join(', ') : 'sans-serif';
  
  // Reconstruct with proper formatting
  const cleanFontName = `${fontName}, ${fontStack}`;

  getGemFindThemeTargets().forEach((root) => {
    root.style.setProperty('--body-font-family', cleanFontName);
    root.style.setProperty('--h4', cleanFontName);
    root.style.setProperty('--font-inter', cleanFontName);
    root.style.setProperty('--font-acumin-pro', cleanFontName);
  });
  
  const scope = getGemFindScopeEl();
  if (scope) {
    scope.style.fontFamily = cleanFontName;
  }
};

/**
 * Loads and applies font based on configuration data
 * @param {Object} configData - Configuration data with font_family and theme_font_family
 */
export const loadAndApplyFont = (configData) => {
  if (!configData) return;

  let fontFamily = null;

  // Normalize font_family for comparison (trim and handle case)
  const normalizedFontFamily = configData.font_family ? String(configData.font_family).trim() : '';
  const themeFontFamily = (configData.theme_font_family && String(configData.theme_font_family).trim()) 
    ? String(configData.theme_font_family).trim() 
    : '';
  
  // Simple logic: If font_family is "Other", use theme_font_family, otherwise use font_family
  if (normalizedFontFamily.toLowerCase() === "other") {
    // User selected "Other", so use the custom font from theme_font_family
    if (themeFontFamily) {
      fontFamily = themeFontFamily;
    } else {
      // If theme_font_family is empty, fall back to default
      fontFamily = 'Manrope, sans-serif';
    }
  } else if (normalizedFontFamily) {
    // font_family is not "Other", use font_family
    fontFamily = configData.font_family;
  } else {
    // No font_family specified, use default
    fontFamily = 'Manrope, sans-serif';
  }

  // Load Google Font if needed
  loadGoogleFont(fontFamily);

  // Apply the font
  applyFontFamily(fontFamily);
};

/**
 * Resets font to default
 */
export const resetFont = () => {
  getGemFindThemeTargets().forEach((root) => {
    root.style.setProperty('--body-font-family', 'Manrope, sans-serif');
    root.style.setProperty('--h4', 'Manrope, sans-serif');
    root.style.setProperty('--font-inter', 'Manrope, sans-serif');
    root.style.setProperty('--font-acumin-pro', 'Manrope, sans-serif');
  });
  
  const scope = getGemFindScopeEl();
  if (scope) {
    scope.style.fontFamily = 'Manrope, sans-serif';
  }
};
