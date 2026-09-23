/**
 * CSS Theme utility functions
 */

/**
 * Injects CSS custom properties into the document root
 * @param {Object} cssConfig - CSS configuration from backend API
 */
export const injectCSSVariables = (cssConfig) => {
  const root = document.documentElement;
  
  if (!cssConfig) return;
  
  // Map API response to CSS custom properties
  const cssVariables = {
    '--link': cssConfig.link,
    '--header': cssConfig.header,
    '--button': cssConfig.button,
    '--slider': cssConfig.slider,
    '--hover': cssConfig.hover,
    '--background': cssConfig.background,
    '--background-text': cssConfig.backgroundText
  };
  
  // Apply CSS custom properties to root element
  Object.entries(cssVariables).forEach(([property, value]) => {
    if (value) {
      root.style.setProperty(property, value);
    }
  });
};

/**
 * Resets CSS variables to default values
 */
export const resetCSSVariables = () => {
  const root = document.documentElement;
  
  const defaultVariables = {
    '--link': '#000000',
    '--header': '#ffffff',
    '--button': '#000000',
    '--slider': '#000000',
    '--hover': '#000000',
    '--background': '#ffffff',
    '--background-text': '#000000'
  };
  
  Object.entries(defaultVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};
