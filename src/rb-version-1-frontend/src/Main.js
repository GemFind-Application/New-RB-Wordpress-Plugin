import React, { useEffect, useState } from "react";
import { Routes, Route, Router, Redirect, useLocation } from "react-router-dom";
import Setting from "./components/settings/Setting";
import SettingDetails from "./components/settings-details/SettingDetails";
import DiamondtoolSetting from "./components/diamondtoolsettings/DiamondtoolSetting";
import DiamondSettingDetails from "./components/diamondsettings-details/DiamondSettingDetails";
import CompleteringSetting from "./components/completering-details/CompleteringSetting";
import Compare from "./components/compare/Compare";
import { appService } from './Services';
import { settingService } from './Services/setting.service';
import { injectCSSVariables, resetCSSVariables } from './utils/cssTheme';
import { loadAndApplyFont, resetFont } from './utils/fontLoader';
import ActivationModal from './components/ActivationModal';
import { shopDomain, RB_BASE, jcBase, jcVideoUrl } from './wp/wpEnv';

import Skeleton from "react-loading-skeleton";

// Suppress ResizeObserver loop error
const resizeObserverErrorHandler = (e) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
        e.stopImmediatePropagation();
    }
};
window.addEventListener('error', resizeObserverErrorHandler);

const Main = () => {
    const [skeltonLoad, setskeltonLoad] = useState(false);
    const [configAppData, setConfigAppData] = useState({});
    const [isConfigLoaded, setIsConfigLoaded] = useState(false);
    const [hasActivePlan, setHasActivePlan] = useState(null); // null = checking, true = active, false = inactive
    const [isPlanCheckComplete, setIsPlanCheckComplete] = useState(false);
    const { pathname } = useLocation();

    // FIRST: Check plan activation before any other API calls
    const checkPlanFirst = async () => {
        try {
            // Shop key localized by WordPress (gemfindRBConfig.shop / #shop_domain)
            const shop = shopDomain();

            if (!shop) {
                console.error('Shop domain not found');
                setHasActivePlan(false);
                setIsPlanCheckComplete(true);
                return;
            }

            // WordPress has no app billing: the plugin is always active once installed.
            const isActive = true;
            setHasActivePlan(isActive);
            setIsPlanCheckComplete(true);

            // Only proceed if plan is active
            if (!isActive) {
                return;
            }

            // Plan is active, proceed with config and other data fetching
            fetchConfigSetting(shop);
        } catch (planErr) {
            console.error('Error loading Ring Builder:', planErr);
            setHasActivePlan(true);
            setIsPlanCheckComplete(true);
        }
    };

    // Function to get config data (only called if plan is active)
    const fetchConfigSetting = async (shop) => {
        try {
            // Call the API with shop parameter
            const response = await appService.getConfigSetting(shop);
            if (response && response.data) {
                const data = response.data; // The Laravel controller wraps data in a 'data' key
                setConfigAppData(data);
                setIsConfigLoaded(true);
                
                // Fetch and apply CSS configuration
                let cssConfig = {};
                try {
                    cssConfig = await settingService.getCSSConfiguration(shop);
                    if (cssConfig.set_default_view === 1) {
                        resetCSSVariables();
                        resetFont();
                    } else {
                        injectCSSVariables(cssConfig);
                    }
                } catch (error) {
                    console.log("Error fetching CSS configuration:", error);
                    resetCSSVariables();
                    resetFont();
                }
                
                // Load and apply font from config data
                // Check if font_family is "Other" and use theme_font_family
                if (data.font_family === "Other" && data.theme_font_family) {
                    loadAndApplyFont({ ...data, font_family: "Other", theme_font_family: data.theme_font_family });
                } else if (data.font_family) {
                    loadAndApplyFont(data);
                }
                
                // Set up window variables for backward compatibility - use the entire response
                window.initData = {
                    data: [{
                        ...data,
                        // Add color variables from CSS configuration (using actual property names)
                        hover_colour: cssConfig.hover || '#000',
                        link_colour: cssConfig.link || '#000',
                        slider_colour: cssConfig.slider || '#000',
                        header_colour: cssConfig.header || '#fff',
                        text_colour: cssConfig.backgroundText || '#000',
                        background_colour: cssConfig.background || '#fff',
                        button_colour: cssConfig.button || '#FF5722',
                        // Ensure font_family and theme_font_family are available
                        font_family: data.font_family || 'Lato',
                        theme_font_family: data.theme_font_family || ''
                    }]
                };
                
                window.currency = data.currency || 'USD';
                window.currencyFrom = data.currencyFrom || 'USD';
                window.compareproduct = [];
                window.compareProductDiamondType = [];
                window.miniprice = 0;
                window.serverurl = data.dealerauthapi;
                window.maxprice = 0;
                window.spinloader = "true";
                setskeltonLoad(true);
                
                if (data.show_powered_by === "1") {
                    const poweredByElement = document.getElementById("gemfind_diamondtool_powered_by");
                    if (poweredByElement) {
                        poweredByElement.style.display = "block";
                    }
                }
            }
        } catch (error) {
            console.log("Error fetching config:", error);
            // Fallback to localhost data for development
            const fallbackData = {
                show_powered_by: false,
                sorting_order: 'cost-l-h',
                price_row_format: 'left',
                default_view: 'list',
                display_tryon: "1",
                show_filter_info: "true",
                enable_email_friend: true,
                enable_more_info: true,
                enable_print: true,
                enable_schedule_viewing: true,
                enable_hint: true,
                dealerid: 1089,
                set_default_view: "1",
                products_pp: 48,
                font_family: 'Manrope',
                shop: shopDomain(),
                dealerauthapi: jcBase(),
                // Add required API endpoints for diamond filtering
                filterapi: `${jcBase()}/GetDiamondsJCOptions?`,
                filterapifancy: `${jcBase()}/GetDiamondsJCOptions?`,
                diamondlistapi: `${jcBase()}/GetDiamondsJC?`,
                diamondlistapifancy: `${jcBase()}/GetDiamondsJC?`,
                diamonddetailapi: `${jcBase()}/GetDiamondDetail?`,
                diamondshapeapi: `${jcBase()}/GetDiamondShape?`,
                ringfiltersapi: `${jcBase()}/GetRingFilters?`,
                mountinglistapi: `${jcBase()}/GetMountingList?`,
                mountinglistapifancy: `${jcBase()}/GetMountingList?`,
                navigationapi: `${jcBase()}/GetNavigation?`,
                navigationapirb: `${jcBase()}/GetRBNavigation?`,
                videoapi: jcVideoUrl()
            };
            setConfigAppData(fallbackData);
            setIsConfigLoaded(true);
            setskeltonLoad(true);
            
            // Apply default CSS variables for fallback
            resetCSSVariables();
            resetFont();
            
            // Set up window variables for backward compatibility with fallback data
            window.initData = {
                data: [{
                    dealerid: fallbackData.dealerid,
                    currency: 'USD',
                    currencyFrom: 'USD',
                    show_powered_by: fallbackData.show_powered_by,
                    server_url: fallbackData.dealerauthapi,
                    ringfiltersapi: fallbackData.ringfiltersapi,
                    mountinglistapi: fallbackData.mountinglistapi,
                    mountinglistapifancy: fallbackData.mountinglistapifancy,
                    // Diamond API endpoints
                    filterapi: fallbackData.filterapi,
                    filterapifancy: fallbackData.filterapifancy,
                    diamondlistapi: fallbackData.diamondlistapi,
                    diamondlistapifancy: fallbackData.diamondlistapifancy,
                    diamonddetailapi: fallbackData.diamonddetailapi,
                    diamondshapeapi: fallbackData.diamondshapeapi,
                    navigationapi: fallbackData.navigationapi,
                    navigationapirb: fallbackData.navigationapirb,
                    videoapi: fallbackData.videoapi,
                    // Additional configuration (matching CSS config property names)
                    hover_colour: '#000',
                    link_colour: '#000',
                    slider_colour: '#000',
                    header_colour: '#fff',
                    text_colour: '#000',
                    background_colour: '#fff',
                    button_colour: '#FF5722',
                    sorting_order: fallbackData.sorting_order,
                    price_row_format: fallbackData.price_row_format,
                    default_view: fallbackData.default_view,
                    display_tryon: fallbackData.display_tryon,
                    show_filter_info: fallbackData.show_filter_info,
                    enable_email_friend: fallbackData.enable_email_friend,
                    enable_more_info: fallbackData.enable_more_info,
                    enable_print: fallbackData.enable_print,
                    enable_schedule_viewing: fallbackData.enable_schedule_viewing,
                    enable_hint: fallbackData.enable_hint,
                    set_default_view: fallbackData.set_default_view,
                    products_pp: fallbackData.products_pp,
                    font_family: fallbackData.font_family,
                    shop: fallbackData.shop
                }]
            };
        }
    };

    useEffect(() => {
        // FIRST: Check plan activation before any other API calls
        checkPlanFirst();
    }, []);

    // Show activation modal if plan check is complete and plan is not active
    if (isPlanCheckComplete && hasActivePlan === false) {
        return <ActivationModal />;
    }

    // Show loading or nothing while checking plan
    if (!isPlanCheckComplete || hasActivePlan === null) {
        return null; // or a loading spinner
    }

    if (skeltonLoad === true && isConfigLoaded === true) {
        return (
            <Routes>
                <Route
                    path="/"
                    element={<Setting />}
                />
                <Route
                    path={`${RB_BASE}/settings`}
                    element={<Setting />}
                />
                <Route
                    path={`${RB_BASE}/settings/islabsettings/:id`}
                    element={<Setting />}
                />
                <Route
                    path={`${RB_BASE}/settings/*`}
                    element={<SettingDetails />}
                />
                <Route
                    path={`${RB_BASE}/labgrownsettings`}
                    element={<Setting />}
                />
                <Route
                    path={`${RB_BASE}/labgrownsettings/*`}
                    element={<SettingDetails />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools`}
                    element={<DiamondtoolSetting />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/navlabgrown`}
                    element={<DiamondtoolSetting />}
                />
                <Route
                    path={`${RB_BASE}/compare`}
                    element={<Compare />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/compare`}
                    element={<Compare />}
                />
                <Route
                    path={`${RB_BASE}/navlabgrown`}
                    element={<DiamondtoolSetting />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/navfancycolored`}
                    element={<DiamondtoolSetting />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/product/*`}
                    element={<DiamondSettingDetails />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/product/*/*`}
                    element={<DiamondSettingDetails />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/completering`}
                    element={<CompleteringSetting />}
                />
                <Route
                    path={`${RB_BASE}/completering`}
                    element={<CompleteringSetting />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/shape/:shape`}
                    element={<DiamondtoolSetting />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/diamondtype/navlabgrown`}
                    element={<DiamondtoolSetting />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/diamondtype/navlabgrown/shape/:shape`}
                    element={<DiamondtoolSetting />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/navlabgrown/shape/:shape`}
                    element={<DiamondtoolSetting />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/diamondtype/navfancycolored`}
                    element={<DiamondtoolSetting />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/diamondtype/navfancycolored/shape/:shape`}
                    element={<DiamondtoolSetting />}
                />
                <Route
                    path={`${RB_BASE}/diamondtools/navfancycolored/shape/:shape`}
                    element={<DiamondtoolSetting />}
                />
                <Route
                    path={`${RB_BASE}/*`}
                    element={<Setting />}
                />
                <Route
                    path="*"
                    element={<Setting />}
                />
            </Routes>
        );
    } else {
        return (
            <>
                <div className="tool-container">
                    <Skeleton height={80} />
                    <Skeleton />
                    <div className="Skeleton-type">
                        <Skeleton count={9} height={60} />
                    </div>
                    <div className="Skeleton-settings">
                        <div className="skeleton-div">
                            <div className="skelton-info">
                                {/* <h4 className="div-left"><Skeleton /></h4> */}
                                <div className="div-right">
                                    {" "}
                                    <Skeleton count={8} height={60} />
                                </div>
                            </div>
                        </div>
                        <div className="skeleton-div">
                            <div className="skelton-info">
                                {/* <h4 className="div-left"><Skeleton /></h4> */}
                                <div className="div-right-price">
                                    <Skeleton height={60} />
                                </div>
                                <div className="div-right-metal">
                                    <Skeleton height={60} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="s_gridview">
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                        </div>
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                        </div>
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                        </div>
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                        </div>
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                        </div>
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                        </div>
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                        </div>
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                            <Skeleton height={25} width={200} />
                        </div>
                    </div>
                    <Skeleton />
                </div>
            </>
        );
    }
};

export default Main;
