/**
 * Font loading utility functions
 */

/**
 * List of common Google Fonts that can be loaded dynamically
 * This helps determine if we need to load a Google Font
 */
const GOOGLE_FONTS = [
  'Arial', 'Helvetica', 'Helvetica Neue', 'Verdana', 'Times New Roman',
  'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
  'Trebuchet MS', 'Arial Black', 'Impact', 'Manrope', 'Lato', 'Inter',
  'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 'Raleway', 'Ubuntu',
  'Playfair Display', 'Merriweather', 'Lora', 'Libre Baskerville'
];

/**
 * Loads a Google Font dynamically by creating a link element
 * @param {string} fontFamily - Font family name
 */
const loadGoogleFont = (fontFamily) => {
  // Check if font is already loaded
  const existingLink = document.querySelector(`link[data-font="${fontFamily}"]`);
  if (existingLink) {
    return; // Font already loaded
  }

  // Create link element for Google Fonts
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;500;600;700;900&display=swap`;
  link.setAttribute('data-font', fontFamily);
  document.head.appendChild(link);
};

/**
 * Applies font family to CSS custom properties
 * @param {string} fontFamily - Font family name to apply
 */
export const applyFontFamily = (fontFamily) => {
  if (!fontFamily) return;

  const root = document.documentElement;
  
  // Set CSS custom properties for font family (matching dl-version-2-frontend pattern)
  root.style.setProperty('--body-font-family', fontFamily);
  root.style.setProperty('--h4', fontFamily);
  root.style.setProperty('--font-inter', fontFamily);
  root.style.setProperty('--font-acumin-pro', fontFamily);
  
  // Also apply directly to body for backward compatibility
  document.body.style.fontFamily = fontFamily;
  
  // Apply to tool-container class and all its children
  const toolContainer = document.querySelector('.tool-container');
  if (toolContainer) {
    toolContainer.style.fontFamily = fontFamily;
    
    // Apply to common elements within tool-container
    // Exclude Font Awesome icons (i elements with fa classes) to preserve their font-family
    const style = document.createElement('style');
    style.id = 'dynamic-font-style';
    style.textContent = `
      .tool-container {
        font-family: ${fontFamily} !important;
      }
      .tool-container h1,
      .tool-container h2,
      .tool-container h3,
      .tool-container h4,
      .tool-container h5,
      .tool-container h6,
      .tool-container p,
      .tool-container label,
      .tool-container input,
      .tool-container select,
      .tool-container textarea,
      .tool-container button,
      .tool-container a,
      .tool-container li,
      .tool-container td,
      .tool-container th,
      .tool-container span:not([class*="fa"]),
      .tool-container div:not([class*="fa"]) {
        font-family: ${fontFamily} !important;
      }
      /* Explicitly preserve Font Awesome font-family - must come after to override */
      .tool-container i,
      .tool-container i.fa,
      .tool-container i.fas,
      .tool-container i.far,
      .tool-container i.fab,
      .tool-container i[class*="fa"],
      .tool-container [class*="fa"],
      .tool-container [class*="fas"],
      .tool-container [class*="far"],
      .tool-container [class*="fab"] {
        font-family: "Font Awesome 5 Free", "Font Awesome 5 Brands", "Font Awesome 5 Pro" !important;
      }
    `;
    
    // Remove existing dynamic font style if present
    const existingStyle = document.getElementById('dynamic-font-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
  }
};

/**
 * Loads and applies font based on configuration
 * @param {Object} configData - Configuration data from window.initData.data[0] or can be null to read from window.initData
 */
export const loadAndApplyFont = (configData = null) => {
  // If no configData provided, try to read from window.initData
  if (!configData && window.initData && window.initData.data && window.initData.data[0]) {
    configData = window.initData.data[0];
  }

  if (!configData) return;

  let fontFamily = null;

  // Check if font_family is "Other" and use theme_font_family
  if (configData.font_family === "Other" && configData.theme_font_family) {
    fontFamily = configData.theme_font_family;
  } else if (configData.font_family && configData.font_family !== "Other") {
    fontFamily = configData.font_family;
  }

  // If no font specified, use default
  if (!fontFamily) {
    fontFamily = 'Lato'; // Default font from style.scss
  }

  // Check if it's a Google Font and load it dynamically
  // For fonts that might be Google Fonts, try loading them
  // Note: System fonts like Arial, Helvetica don't need loading
  const isSystemFont = ['Arial', 'Helvetica', 'Helvetica Neue', 'Verdana', 
    'Times New Roman', 'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS',
    'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Grande'].includes(fontFamily);
  
  if (!isSystemFont) {
    // Try to load as Google Font (will work for most Google Fonts)
    loadGoogleFont(fontFamily);
  }

  // Apply the font
  applyFontFamily(fontFamily);
};

/**
 * Resets font to default
 */
export const resetFont = () => {
  const root = document.documentElement;
  
  root.style.setProperty('--body-font-family', 'Lato, sans-serif');
  root.style.setProperty('--h4', 'Lato, sans-serif');
  root.style.setProperty('--font-inter', 'Lato, sans-serif');
  root.style.setProperty('--font-acumin-pro', 'Lato, sans-serif');
  
  document.body.style.fontFamily = 'Lato, sans-serif';
  
  // Remove dynamic font style if present
  const existingStyle = document.getElementById('dynamic-font-style');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const toolContainer = document.querySelector('.tool-container');
  if (toolContainer) {
    toolContainer.style.fontFamily = 'Lato, sans-serif';
  }
};
