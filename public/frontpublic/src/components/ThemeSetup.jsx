import React, { useEffect } from 'react';
import { loadAndApplyFont } from '../utils/fontLoader';
import { getGemFindThemeTarget } from '../utils/gemfindScope';

const ThemeSetup = ({styleDataDynamic,documentLoaded,configAppData}) => {
  useEffect(() => {
    const themeRoot = getGemFindThemeTarget();
    if(Object.keys(styleDataDynamic).length !== 0 && styleDataDynamic.set_default_view==0){
      themeRoot.style.setProperty('--beige-00', (styleDataDynamic.columnHeaderAccent));
      themeRoot.style.setProperty('--beige-05', (styleDataDynamic.columnHeaderAccent));
      themeRoot.style.setProperty('--accent', (styleDataDynamic.callToActionButton));
      themeRoot.style.setProperty('--slider-color', (styleDataDynamic.slider_barmakian));
      themeRoot.style.setProperty('--slider-thumb', (styleDataDynamic.slider_barmakian));
      themeRoot.style.setProperty('--menus-background', (styleDataDynamic.callToActionButton));
      themeRoot.style.setProperty('--link-color', (styleDataDynamic.linkColor));
      themeRoot.style.setProperty('--over-effect', (styleDataDynamic.hoverEffect));
      themeRoot.style.setProperty('--note-container', (styleDataDynamic.columnHeaderAccent));
      themeRoot.style.setProperty('--color-mediumslateblue', (styleDataDynamic.linkColor));      
      themeRoot.style.setProperty('--border-color', (styleDataDynamic.callToActionButton));
      themeRoot.style.setProperty('--backgroundtext', (styleDataDynamic.backgroundText));
      themeRoot.style.setProperty('--backgroundmenutext', ('#fff'));
      themeRoot.style.setProperty('--backgroundmenutextdiamond', (styleDataDynamic.backgroundText));
      themeRoot.style.setProperty('--beige-04', (styleDataDynamic.callToActionButton));
      themeRoot.style.setProperty('--beige-05', (styleDataDynamic.callToActionButton));
      themeRoot.style.setProperty('--notselectedmenucolor', (styleDataDynamic.backgroundText));
			themeRoot.style.setProperty('--hoverBGC', (styleDataDynamic.background));
      themeRoot.style.setProperty('--nav-active-background-color', (styleDataDynamic.navActiveBackgroundColor || ''));
      themeRoot.style.setProperty('--nav-inactive-background-color', (styleDataDynamic.navInactiveBackgroundColor || ''));
      themeRoot.style.setProperty('--nav-active-text-color', (styleDataDynamic.navActiveTextColor || ''));
      themeRoot.style.setProperty('--nav-inactive-text-color', (styleDataDynamic.navInactiveTextColor || ''));
    }
    
    if (configAppData && (configAppData.font_family || configAppData.theme_font_family)) {
      loadAndApplyFont(configAppData);
    }
  }, [styleDataDynamic,documentLoaded,configAppData]);
  
  return null;
};
export default ThemeSetup;
