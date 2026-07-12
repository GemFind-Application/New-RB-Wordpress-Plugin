import { React, useEffect, useState, createContext } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Compare from "./pages/compare";
import DiamondPage from "./pages/diamond-details";
import Complete from "./pages/complete";
import Diamond from "./pages/diamond";
import Settings from "./pages/settings";
import SettingDetails from "./pages/setting-details";
import { appService } from './Services';
import { settingService } from './Services';
import AlertPopUp from "./components/AlertPopUp";
import Footer from "./components/Footer";
import ThemeSetup from './components/ThemeSetup';
import ShowError from "./components/ShowError";
import ActivationModal from "./components/ActivationModal";
import themes from './Services/themes.json';
import { buildLegacyRoutes, LegacyLabSettingsRoute } from "./routes/legacyRoutes";
function App() {
  const location = useLocation();
  let diamondIdsToCompare = JSON.parse(localStorage.getItem('diamondIdsToCompare'));
  const [additionOptionSetting, setAdditionOptionSetting] = useState([]);
  const [isAdditionOptionSettingLoaded, setIsAdditionOptionSettingLoaded] = useState(false);
  const [settingNavigation, setSettingNavigation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [isSettingNavLoaded, setIsSettingNavLoaded] = useState(false);
  const [compareDiamondsId, setCompareDiamondsId] = useState(diamondIdsToCompare ? diamondIdsToCompare.length > 0 ? diamondIdsToCompare : [] : []);
  const [isLabGrown, setIsLabGrown] = useState(false); // Default to Mined
  const [showAlertPopUp, setshowAlertPopUp] = useState(false);
  const [message, setMessage] = useState('');
  const [initialFilter, setInitialFilter] = useState(false);
  const [styleData, setStyleData] = useState({});
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [title, setTitle] = useState('Compare Diamonds');
  const action = useNavigationType();
  const [styleDataDynamic, setStyleDataDynamic] = useState({});
  const [configAppData, setConfigAppData] = useState({});
  const pathname = location.pathname;
  const [isconfigLoaded, setIsConfigLoaded] = useState(false);
  const [shopUrl, setShopUrl] = useState('');
  const [error, setError] = useState('');
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(null); // null = checking, true = active, false = inactive
  const [isPlanCheckComplete, setIsPlanCheckComplete] = useState(false);
  const navigate = useNavigate();
  const shopUrlforEmail = `${import.meta.env.VITE_RING_URL_EXT}`;
  //console.log(window.location)
  function getSubstringTillCom(url) {
    const index = url.indexOf(".com");
    if (index !== -1) {
      //console.log(url.substring(0, index + 4))
      return url.substring(0, index + 4); // +4 to include ".com"
    } else {
      // console.log(url)
      return url; // Return the original URL if ".com" is not found
    }
  }
  // FIRST: Check plan activation before any other API calls (skipped on WordPress — always active)
  useEffect(() => {
    async function checkPlanFirst() {
      try {
        const wpConfig = typeof window !== 'undefined' ? window.gemfindRBConfig : null;
        if (wpConfig) {
          setHasActivePlan(true);
          setIsPlanCheckComplete(true);
          const shop = wpConfig.shop || window.location.hostname;
          fetchConfigSetting(shop);
          return;
        }

        // Get shop domain
        let shop = '';
        if (window.location.hostname === 'localhost') {
          shop = 'gemfind-product-demo-10.myshopify.com';
        } else {
          const shopElement = document.getElementById("shop_domain");
          if (shopElement) {
            shop = shopElement.value;
          }
        }

        if (!shop) {
          console.error('Shop domain not found');
          setHasActivePlan(false);
          setIsPlanCheckComplete(true);
          return;
        }

        const planCheck = await appService.checkActivePlan(shop);
        const isActive = planCheck?.hasActivePlan === true || planCheck?.hasActivePlan === 'true' || planCheck?.active === true || planCheck === true;
        setHasActivePlan(isActive);
        setIsPlanCheckComplete(true);

        if (!isActive) {
          return;
        }

        fetchConfigSetting(shop);
      } catch (planErr) {
        console.error('Error checking active plan:', planErr);
        if (typeof window !== 'undefined' && window.gemfindRBConfig) {
          setHasActivePlan(true);
          setIsPlanCheckComplete(true);
          fetchConfigSetting(window.gemfindRBConfig.shop || window.location.hostname);
          return;
        }
        setHasActivePlan(false);
        setIsPlanCheckComplete(true);
      }
    }

    // Function to get config data from database (only called if plan is active)
    async function fetchConfigSetting(shop) {
      try {
        const res = await appService.getConfigSetting(shop);
        if (res) {
          let data = res.data;
          setConfigAppData(data);
          setShopUrl(res.data.shop || shop);
          setIsConfigLoaded(true);
        }
      } catch (err) {
        console.error('Error fetching config:', err);
        setError("Failed to fetch products. Please try again later.");
      }
    }

    checkPlanFirst();
  }, []);
  useEffect(() => {
    //if starting is from diamond tools then save this in localstorage to get the api change accordingly for getting diamond filter
    let storedFlowData = JSON.parse(localStorage.getItem('startflow'));
    if (storedFlowData === null) {
      const pathname = location.pathname;
      localStorage.setItem('startflow', JSON.stringify({ 'path': pathname, 'isLoaded': false }));
    }
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    //function to get style data
    async function fetchStyleData(id, shop) {
      try {
        const res = await appService.getStyleData(id, shop);

        if (res !== null) {
          setStyleData(res);
          
          // Build style data from either predefined themes.json or custom colors from API
          const selectedThemeName = (res.selected_theme || '').toString();
          const isPredefinedTheme = selectedThemeName && selectedThemeName !== 'unset' && selectedThemeName !== 'custom' && selectedThemeName !== 'default';

          // Helper to map DB snake_case theme to frontend keys used across the app
          const mapDbThemeToStyle = (t) => ({
            hoverEffect: t.hover_color || '',
            columnHeaderAccent: t.header_color || '',
            linkColor: t.link_color || '',
            callToActionButton: t.button_color || '',
            background: t.background_color || '',
            slider_barmakian: t.slider_color || '',
            backgroundText: t.background_text_color || '',
            navActiveBackgroundColor: t.nav_active_background_color || '',
            navInactiveBackgroundColor: t.nav_inactive_background_color || '',
            navActiveTextColor: t.nav_active_text_color || '',
            navInactiveTextColor: t.nav_inactive_text_color || '',
            set_default_view: res.set_default_view
          });

          let styleDataObj;
          if (isPredefinedTheme) {
            const matchedTheme = themes.find(th => th.theme_name === selectedThemeName);
            styleDataObj = matchedTheme ? mapDbThemeToStyle(matchedTheme) : {
              hoverEffect: res.hover ? res.hover : '',
              columnHeaderAccent: res.header,
              linkColor: res.link,
              callToActionButton: res.button,
              background: res.background,
              slider_barmakian: res.slider,
              backgroundText: res.backgroundText,
              navActiveBackgroundColor: res.navActiveBackgroundColor || '',
              navInactiveBackgroundColor: res.navInactiveBackgroundColor || '',
              navActiveTextColor: res.navActiveTextColor || '',
              navInactiveTextColor: res.navInactiveTextColor || '',
              set_default_view: res.set_default_view
            };
          } else {
            // Use custom colors from API (unset/custom/default cases)
            styleDataObj = {
              hoverEffect: res.hover ? res.hover : '',
              columnHeaderAccent: res.header,
              linkColor: res.link,
              callToActionButton: res.button,
              background: res.background,
              slider_barmakian: res.slider,
              backgroundText: res.backgroundText,
              navActiveBackgroundColor: res.navActiveBackgroundColor || '',
              navInactiveBackgroundColor: res.navInactiveBackgroundColor || '',
              navActiveTextColor: res.navActiveTextColor || '',
              navInactiveTextColor: res.navInactiveTextColor || '',
              set_default_view: res.set_default_view
            };
          }
          
          setStyleDataDynamic(styleDataObj);
          setIsStyleLoaded(true);
        } else {
          setIsStyleLoaded(true);
        }
      } catch (err) {
        console.error("Error fetching style details:", err);
        setError("Failed to fetch products. Please try again later.");
      }
    }
    //function to get app setting data
    async function fetchAppSetting(id) {
      try {
        const res = await appService.getAdditionalOption(id);
        if (res[0]) {
          setAdditionOptionSetting(res[0][0]);
          setIsAdditionOptionSettingLoaded(true);
        }
      } catch (err) {
        console.error("Error fetching app setting details:", err);
        setError("Failed to fetch products. Please try again later.");
      }
    }
    //function to get setting navigation
    async function fetchSettingNavigation(id) {
      try {
        let res = {}
        let splitArray = location.pathname.split('/');
        const topSection = splitArray[1] || '';
        if (topSection === 'settings' || splitArray.includes('islabsettings')) {
          const isLab = splitArray.includes('islabsettings');
          setIsLabGrown(isLab);
          res = await settingService.getSettingNavigation(id);

          if (res[0]) {
            setSettingNavigation(res[0]);
            setIsSettingNavLoaded(true);
          }
        }
        if (topSection === 'diamondtools' || topSection === 'diamondlink') {
          const path = location.pathname.toLowerCase();
          let isLab = false;
          if (path.includes('navlabgrown') || path.includes('labcreated')) {
            isLab = true;
          } else if (
            path.includes('navfancycolored') ||
            path.includes('fancydiamonds') ||
            path.includes('navfancy')
          ) {
            isLab = 'fancy';
          } else if (path.includes('navstandard')) {
            isLab = false;
          }
          setIsLabGrown(isLab);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products. Please try again later.");
      }
    }
    if (configAppData.dealerid !== undefined) {
      fetchSettingNavigation(configAppData.dealerid);
      fetchAppSetting(configAppData.dealerid);
      fetchStyleData(configAppData.dealerid, configAppData.shop);
    }

  }, [configAppData])
  useEffect(() => {
    if (compareDiamondsId.length > 0) {
      //compareDiamondsId.splice(0, compareDiamondsId.length);
    }
  }, [isLabGrown])
  useEffect(() => {
    if (isSettingNavLoaded === true && isStyleLoaded === true && isconfigLoaded === true) {
      setShowLoading(false)
    }
  }, [isSettingNavLoaded, isStyleLoaded, isconfigLoaded])
  useEffect(() => {
    let title = "";
    let metaDescription = "";
    let metaKeywords = "";
    let newPathName = pathname.split('/');
    // Handle different route patterns
    if (newPathName[1] === "" || newPathName[1] === undefined) {
      // Root path "/"
      title = configAppData.ring_meta_title;
      metaDescription = configAppData.ring_meta_description;
      metaKeywords = configAppData.ring_meta_keywords;
    } else if (newPathName[1] === "settings") {
      // Settings pages
      title = configAppData.ring_meta_title;
      metaDescription = configAppData.ring_meta_description;
      metaKeywords = configAppData.ring_meta_keywords;
    } else if (newPathName[1] === "diamondtools" || newPathName[1] === "diamondlink") {
      // Diamond tools pages
      if (newPathName[2] === "compare") {
        // Compare page
        title = configAppData.diamond_meta_title;
        metaDescription = configAppData.diamond_meta_description;
        metaKeywords = configAppData.diamond_meta_keyword;
      } else {
        // Other diamond tools pages
        title = configAppData.diamond_meta_title;
        metaDescription = configAppData.diamond_meta_description;
        metaKeywords = configAppData.diamond_meta_keyword;
      }
    } else if (newPathName[1] === "complete") {
      // Complete page
      title = "";
      metaDescription = "";
      metaKeywords = "";
    }
    
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta description
    if (metaDescription) {
      let metaDescriptionTag = document.querySelector('head > meta[name="description"]');
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      } else {
        // Create meta description tag if it doesn't exist
        metaDescriptionTag = document.createElement('meta');
        metaDescriptionTag.name = 'description';
        metaDescriptionTag.content = metaDescription;
        document.head.appendChild(metaDescriptionTag);
      }
    }

    // Update meta keywords
    if (metaKeywords) {
      let metaKeywordsTag = document.querySelector('head > meta[name="keywords"]');
      if (metaKeywordsTag) {
        metaKeywordsTag.content = metaKeywords;
      } else {
        // Create meta keywords tag if it doesn't exist
        metaKeywordsTag = document.createElement('meta');
        metaKeywordsTag.name = 'keywords';
        metaKeywordsTag.content = metaKeywords;
        document.head.appendChild(metaKeywordsTag);
      }
    }
  }, [pathname, configAppData]);
  //to navigate to compare page 
  const onCompareContainerClick = () => {
    if (compareDiamondsId.length < 2) {
      setshowAlertPopUp(true)
      setMessage('Please select minimum 2 diamonds to compare.')
    } else {
      if (compareDiamondsId.length > 6) {
        setshowAlertPopUp(true)
        setMessage('You can select a maximum of 6 diamonds to compare! Please check your compare item page you have some items in your compare list.')
      } else {
        setshowAlertPopUp(false)
        setMessage('');
        navigate("/diamondtools/compare");
      }
    }
  };
  //to add compare diamond ids
  // diamondType can be: false (mined/natural), true (lab grown), or 'fancy' (fancy diamonds)
  const addCompareDiamondIds = (diamondId, diamondType = false) => {
    const diamondIdStr = String(diamondId);
    
    // Helper function to normalize compare items to object format
    const normalizeItem = (item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        return { diamondId: String(item), diamondType: false }; // Default to mined for old format
      }
      return item;
    };
    
    // Normalize current compareDiamondsId array
    const normalizedCompare = compareDiamondsId.map(normalizeItem);
    
    // Check if diamond already exists
    const existingIndex = normalizedCompare.findIndex(item => item.diamondId === diamondIdStr);
    
    if (existingIndex !== -1) {
      // Remove from array
      const newcompareArray = normalizedCompare.filter(item => item.diamondId !== diamondIdStr);
      setCompareDiamondsId(newcompareArray);
    } else {
      if (normalizedCompare.length > 5) {
        setshowAlertPopUp(true)
        setMessage('You can select a maximum of 6 diamonds to compare! Please check your compare item page you have some items in your compare list.')
      } else {
        setCompareDiamondsId([...normalizedCompare, { diamondId: diamondIdStr, diamondType: diamondType }]);
      }
    }
    //setCurrentPage(1);
  };
  //to remove diamond ids from compareIds array
  // diamondIdArray can be an array of diamond IDs (strings/numbers) or an array of objects with {diamondId, diamondType}
  const removeCompareDiamondIds = (diamondIdArray) => {
    if (!diamondIdArray || diamondIdArray.length === 0) return;
    
    // Helper function to normalize compare items to object format
    const normalizeItem = (item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        return { diamondId: String(item), diamondType: false };
      }
      return item;
    };
    
    // Normalize current compareDiamondsId array
    const normalizedCompare = compareDiamondsId.map(normalizeItem);
    
    if (diamondIdArray.length > 1) {
      setCompareDiamondsId([])
    } else {
      // Extract diamondId from array (could be string or object)
      const diamondIdToRemove = typeof diamondIdArray[0] === 'object' 
        ? diamondIdArray[0].diamondId 
        : String(diamondIdArray[0]);
      
      const newcompareDiamonds = normalizedCompare.filter(item => item.diamondId !== diamondIdToRemove);
      setCompareDiamondsId(newcompareDiamonds);
    }
  }
  if (error) {
    return <ShowError error={error} />;
  }

  // Show activation modal if plan check is complete and plan is not active
  if (isPlanCheckComplete && hasActivePlan === false) {
    return <ActivationModal />;
  }

  // Show loading or nothing while checking plan
  if (!isPlanCheckComplete || hasActivePlan === null) {
    return null; // or a loading spinner
  }

  return (
    <div className="gemfind-ring-builder-tool gemfind-ring-builder-scope">
      <ThemeSetup styleDataDynamic={styleDataDynamic} documentLoaded={documentLoaded} configAppData={configAppData} />
      {loading && isStyleLoaded && isconfigLoaded &&
        <Routes>
          <Route path="/" element={
            <Settings
              className={styleDataDynamic}
              configAppData={configAppData}
              settingNavigationData={settingNavigation}
              setIsLabGrown={setIsLabGrown}
              isLabGrown={isLabGrown}
              setShowLoading={setShowLoading}
              setDocumentLoaded={setDocumentLoaded}
            />}
          />
          <Route path="/settings" element={
            <Settings
              className={styleDataDynamic}
              configAppData={configAppData}
              settingNavigationData={settingNavigation}
              setIsLabGrown={setIsLabGrown}
              isLabGrown={isLabGrown}
              setShowLoading={setShowLoading}
              setDocumentLoaded={setDocumentLoaded}
            />}
          />
          <Route path="/settings/islabsettings/:settingSlug" element={
            <LegacyLabSettingsRoute
              className={styleDataDynamic}
              configAppData={configAppData}
              settingNavigationData={settingNavigation}
              setIsLabGrown={setIsLabGrown}
              isLabGrown={isLabGrown}
              shopUrl={shopUrl}
              formSetting={additionOptionSetting}
              setShowLoading={setShowLoading}
              setDocumentLoaded={setDocumentLoaded}
            />}
          />
          <Route path="/settings/view/path/:settingId" element={
            <SettingDetails
              setIsLabGrown={setIsLabGrown}
              configAppData={configAppData}
              shopUrl={shopUrl}
              formSetting={additionOptionSetting}
              isLabGrown={isLabGrown}
              settingNavigationData={settingNavigation}
              setShowLoading={setShowLoading}
              setDocumentLoaded={setDocumentLoaded}
            />}
          />
          <Route path="/diamondtools/compare/" element={
            <Compare
              isLabGrown={isLabGrown}
              configAppData={configAppData}
              removeCompareDiamondIds={removeCompareDiamondIds}
              compareDiamondsId={compareDiamondsId}
              setShowLoading={setShowLoading}
            />}
          />
          <Route path="/diamondtools" element={
            <Diamond
              additionOptionSetting={additionOptionSetting}
              configAppData={configAppData}
              addCompareDiamondIds={addCompareDiamondIds}
              compareDiamondsId={compareDiamondsId}
              onCompareContainerClick={onCompareContainerClick}
              isLabGrown={isLabGrown} setIsLabGrown={setIsLabGrown}
              setShowLoading={setShowLoading}
              removeCompareDiamondIds={removeCompareDiamondIds}
            />}
          />
          <Route path="/diamondtools/product/:diamondId" element={
            <DiamondPage
              className={styleData}
              isLabGrown={isLabGrown}
              shopUrl={shopUrl}
              additionOptionSetting={additionOptionSetting}
              configAppData={configAppData}
              formSetting={additionOptionSetting}
              setShowLoading={setShowLoading}
            />}
          />
          <Route path="/diamondtools/product/:diamondId/:type" element={
            <DiamondPage
              className={styleData}
              isLabGrown={isLabGrown}
              shopUrl={shopUrl}
              additionOptionSetting={additionOptionSetting}
              configAppData={configAppData}
              formSetting={additionOptionSetting}
              setShowLoading={setShowLoading}
            />}
          />
          <Route path="/diamondtools/diamondtype/navlabgrown" element={
            <Diamond
              additionOptionSetting={additionOptionSetting}
              configAppData={configAppData}
              addCompareDiamondIds={addCompareDiamondIds}
              compareDiamondsId={compareDiamondsId}
              onCompareContainerClick={onCompareContainerClick}
              isLabGrown={isLabGrown}
              setIsLabGrown={setIsLabGrown}
              setShowLoading={setShowLoading}
              setCompareDiamondsId={setCompareDiamondsId}
            />}
          />
          <Route path="/diamondtools/diamondtype/navfancycolored" element={
            <Diamond
              additionOptionSetting={additionOptionSetting}
              configAppData={configAppData}
              addCompareDiamondIds={addCompareDiamondIds}
              compareDiamondsId={compareDiamondsId}
              onCompareContainerClick={onCompareContainerClick}
              isLabGrown={isLabGrown}
              setIsLabGrown={setIsLabGrown}
              setShowLoading={setShowLoading}
              setCompareDiamondsId={setCompareDiamondsId}
            />}
          />
          <Route path="/diamondtools/completering/" element={
            <Complete
              shopUrl={shopUrl}
              isLabGrown={isLabGrown}
              additionOptionSetting={additionOptionSetting}
              formSetting={additionOptionSetting}
              configAppData={configAppData}
              setShowLoading={setShowLoading}
            />}
          />
          {/* WordPress legacy URL aliases (ringBuilder-old paths) */}
          <Route path="/diamondlink" element={
            <Diamond
              additionOptionSetting={additionOptionSetting}
              configAppData={configAppData}
              addCompareDiamondIds={addCompareDiamondIds}
              compareDiamondsId={compareDiamondsId}
              onCompareContainerClick={onCompareContainerClick}
              isLabGrown={isLabGrown} setIsLabGrown={setIsLabGrown}
              setShowLoading={setShowLoading}
              removeCompareDiamondIds={removeCompareDiamondIds}
            />}
          />
          <Route path="/diamondlink/product/:diamondId" element={
            <DiamondPage
              className={styleData}
              isLabGrown={isLabGrown}
              shopUrl={shopUrl}
              additionOptionSetting={additionOptionSetting}
              configAppData={configAppData}
              formSetting={additionOptionSetting}
              setShowLoading={setShowLoading}
            />}
          />
          <Route path="/diamondlink/product/:diamondId/:type" element={
            <DiamondPage
              className={styleData}
              isLabGrown={isLabGrown}
              shopUrl={shopUrl}
              additionOptionSetting={additionOptionSetting}
              configAppData={configAppData}
              formSetting={additionOptionSetting}
              setShowLoading={setShowLoading}
            />}
          />
          <Route path="/diamondlink/navlabgrown" element={
            <Diamond
              additionOptionSetting={additionOptionSetting}
              configAppData={configAppData}
              addCompareDiamondIds={addCompareDiamondIds}
              compareDiamondsId={compareDiamondsId}
              onCompareContainerClick={onCompareContainerClick}
              isLabGrown={isLabGrown}
              setIsLabGrown={setIsLabGrown}
              setShowLoading={setShowLoading}
              setCompareDiamondsId={setCompareDiamondsId}
            />}
          />
          <Route path="/diamondlink/navfancycolored" element={
            <Diamond
              additionOptionSetting={additionOptionSetting}
              configAppData={configAppData}
              addCompareDiamondIds={addCompareDiamondIds}
              compareDiamondsId={compareDiamondsId}
              onCompareContainerClick={onCompareContainerClick}
              isLabGrown={isLabGrown}
              setIsLabGrown={setIsLabGrown}
              setShowLoading={setShowLoading}
              setCompareDiamondsId={setCompareDiamondsId}
            />}
          />
          <Route path="/diamondlink/compare" element={
            <Compare
              isLabGrown={isLabGrown}
              configAppData={configAppData}
              removeCompareDiamondIds={removeCompareDiamondIds}
              compareDiamondsId={compareDiamondsId}
              setShowLoading={setShowLoading}
            />}
          />
          <Route path="/diamondlink/completering" element={
            <Complete
              shopUrl={shopUrl}
              isLabGrown={isLabGrown}
              additionOptionSetting={additionOptionSetting}
              formSetting={additionOptionSetting}
              configAppData={configAppData}
              setShowLoading={setShowLoading}
            />}
          />
          <Route path="/settings/completering" element={
            <Complete
              shopUrl={shopUrl}
              isLabGrown={isLabGrown}
              additionOptionSetting={additionOptionSetting}
              formSetting={additionOptionSetting}
              configAppData={configAppData}
              setShowLoading={setShowLoading}
            />}
          />
          <Route path="/settings/product/:settingId" element={
            <SettingDetails
              setIsLabGrown={setIsLabGrown}
              configAppData={configAppData}
              shopUrl={shopUrl}
              formSetting={additionOptionSetting}
              isLabGrown={isLabGrown}
              settingNavigationData={settingNavigation}
              setShowLoading={setShowLoading}
              setDocumentLoaded={setDocumentLoaded}
            />}
          />
          {buildLegacyRoutes({
            styleDataDynamic,
            styleData,
            configAppData,
            settingNavigation,
            setIsLabGrown,
            isLabGrown,
            shopUrl,
            additionOptionSetting,
            setShowLoading,
            setDocumentLoaded,
            addCompareDiamondIds,
            compareDiamondsId,
            onCompareContainerClick,
            removeCompareDiamondIds,
            setCompareDiamondsId,
          }).map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      }

      <Footer configAppData={configAppData}></Footer>
      {showAlertPopUp && message != "" &&
        <AlertPopUp
          title={title}
          message={message}
          onClose={() => { setshowAlertPopUp(false); setMessage('') }}>
        </AlertPopUp>
      }
      {showLoading === true &&
        <AlertPopUp
          title={''}
          message={''}
          onClose={() => { setshowAlertPopUp(false); setMessage('') }}>
        </AlertPopUp>}
    </div>

  );
}
export default App;
