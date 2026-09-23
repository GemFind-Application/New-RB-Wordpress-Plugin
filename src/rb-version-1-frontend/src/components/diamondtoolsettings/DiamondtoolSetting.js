import React, { useEffect, useState, useRef } from "react";
import Breadcumb from "../elements/Breadcumb";
import Data from "../elements/data";
import DataDiamond from "../elements/data-diamond";
import Table from "react-bootstrap/Table";
import Topheader from "../elements/Topheader";

import Filter from "./settings-element/Filter";
import DiamondShape from "./settings-element/DiamondShape";
import CutSlider from "./settings-element/CutSlider";
import ColorSlider from "./settings-element/ColorSlider";
import FancyColorSlider from "./settings-element/FancyColorSlider";
import FancyIntensity from "./settings-element/FancyIntensity";
import ClaritySlider from "./settings-element/ClaritySlider";
import CaratSlider from "./settings-element/CaratSlider";
import PriceSlider from "./settings-element/PriceSlider";
import DiamondDetailsListing from "../diamondsettings-details/diamondsettings-element/DiamondDetailsListing";
import { enableSettingFilterRelax, isSettingFilterRelaxed, settingConstrains } from "../../wp/settingFilterRelax";
import Skeleton from "react-loading-skeleton";
import { LoadingOverlay, Loader } from "react-overlay-loader";
import DepthSlider from "./settings-element/DepthSlider";
import TableSlider from "./settings-element/TableSlider";
import PolishSlider from "./settings-element/PolishSlider";
import FluorescenceSlider from "./settings-element/FluorescenceSlider";
import SymmetrySlider from "./settings-element/SymmetrySlider";
import Certificates from "./settings-element/Certificates";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router-dom";
import emerald from "../../images/emerald_Large.jpg";
import marquise from "../../images/marquise_Large.png";
import { useNavigate } from "react-router-dom";
import { RB_BASE } from '../../wp/wpEnv';

// "Last" pip sentinel id = highest real id + 1. Using range.length + 1 broke when ids are sparse
// (e.g. polish only returns id "3" -> sentinel "2" -> min > max, a broken single-handle slider).
const nextSentinelId = (range, idKey) =>
    range && range.length
        ? Math.max(...range.map((item) => Number(item[idKey]) || 0)) + 1
        : 1;

const DiamondtoolSetting = (props) => {
    const location = useLocation();
    var productUrl = location.pathname;
    var part = productUrl.substring(productUrl.lastIndexOf("/") + 1);
    const [shape, setShape] = useState([]);
    const [getshapeselected, shapeselected] = useState("");
    // Bumped to refetch after relaxing setting constraints (see wp/settingFilterRelax.js).
    const [settingRelaxTick, setSettingRelaxTick] = useState(0);
    const [getSelectedCut, setSelectedCut] = useState("");
    const [initCut, setinitCut] = useState(false);
    const [getSelectedColor, setSelectedColor] = useState("");
    const [initColor, setinitColor] = useState(false);
    const [getSelectedClarity, setSelectedClarity] = useState("");
    const [getSelectedfancyColor, setSelectedfancyColor] = useState("");
    const [getSelectedintensity, setSelectedintensity] = useState("");
    const [inticlarit, setinitClarity] = useState(false);
    const [getCaratmin, setCaratmin] = useState("");
    const [getCaratmax, setCaratmax] = useState("");
    const [getPricemin, setPricemin] = useState("");
    const [getPricemax, setPricemax] = useState("");
    const [getDepthmin, setDepthmin] = useState("");
    const [getDepthmax, setDepthmax] = useState("");
    const [getTablemin, setTablemin] = useState("");
    const [getTablemax, setTablemax] = useState("");
    const [getDataSettingProduct, setDataSettingProduct] = useState([]);
    const [getProductCount, setProductCount] = useState("");
    const [skeltonLoad, setskeltonLoad] = useState(false);
    const [getDiamondCut, setDiamondCut] = useState([]);
    const [getDiamondColor, setDiamondColor] = useState([]);
    const [getDiamondClarity, setDiamondClarity] = useState([]);
    const [getDiamondCarat, setDiamondCarat] = useState([]);
    const [getpriceRange, setpriceRange] = useState([]);
    const [getPolish, setPolish] = useState([]);
    const [getfluorescenceRangeData, setfluorescenceRangeData] = useState([]);
    const [getsymmetry, setsymmetry] = useState([]);
    const [getcertificate, setcertificate] = useState([]);
    const [getSelectedpolish, setSelectedpolish] = useState("");
    const [getinitpolish, setinitpolish] = useState(false);
    const [getSelectedfluore, setSelectedfluore] = useState("");
    const [getinitfluore, setinitfluore] = useState(false);
    const [getSelectedsymmetry, setSelectedsymmetry] = useState("");
    const [getinitsymmetry, setinitsymmetry] = useState(false);
    const [getDepth, setDepth] = useState([]);
    const [getTable, setTable] = useState([]);
    const [getTotalPage, setTotalPage] = useState(35);
    const [getStartPage, setStartPage] = useState(1);
    const [getEndPage, setEndPage] = useState(12);
    const [getselectedpageSize, setpageSizeselected] = useState(
        window.initData?.data?.[0]?.products_pp || "12"
    );
    const [getselectedpageno, setselectedpageno] = useState("1");
    const [pageRestoredFromCookie, setPageRestoredFromCookie] = useState(false);
    const [loaded, setLoaded] = useState(false);
    // Default sort matches what the listing shows before any click: Shape ("Cut") ascending.
    const [getpageordertypeelected, setpageordertypeelected] = useState("Cut");
    const [getascdescordertypeelected, setascdescordertypeelected] =
        useState("ASC");
    const [getfilledsearch, setfilledsearch] = useState("");
    const [getDiamondDepth, setDiamondDepth] = useState([]);
    const [gettabname, settabname] = useState("mined");
    const [loadvarible, setloadvariable] = useState(false);
    const [cookies, setCookie] = useCookies(["_wpsavediamondfiltercookie"]);
    const [getlabcookies, setlabcookies] = useCookies([
        "_wpsavedlabgowndiamondfiltercookie",
    ]);
    const [getfancycookies, setfancycookies] = useCookies([
        "_wpsavedfancydiamondfiltercookie",
    ]);
    const [getcomparecookies] = useCookies([
        "_wpsavedcompareproductcookie",
    ]);
    const [getIntensity, setIntensity] = useState([]);
    const [getFancyColor, setFancyColor] = useState([]);
    const [getFancyStatus, setFancyStatus] = useState(false);
    const [getsettingcookies, setsettingcookies] = useCookies([
        "_shopify_ringsetting",
    ]);
    const [getdiamondcookies, setdiamondcookies] = useCookies([
        "_shopify_diamondsetting",
    ]);
    const [getbrowserdiamondcookies, setbrowserdiamondcookies, removeCookie] =
        useCookies(["shopify_diamondbackvalue"]);
    const [, setDiamondTypeCookie] = useCookies(["shopify_diamondtype"]);
    const [getDiamondCookie, setDiamondCookie] = useState(false);
    const [getsettingcookie, setsettingcookie] = useState(false);
    const [getfirsttimeload, setfirsttimeload] = useState(false);
    const [initdataload, setinitdataload] = useState(false);
    const [getShowPriceFilter, setShowPriceFilter] = useState();
    const [certificateType, setcertificateType] = useState("");
    const [getQuerySearchShape, setQuerySearchShape] = useState("0");
    const [isGetPriceSearch, isSetPriceSearch] = useState(false);
    const [navAdvanced, setNavAdvanced] = useState(null);
    const [navigationLoaded, setNavigationLoaded] = useState(false);

    const search = useLocation().search;
    const searchshape = new URLSearchParams(search).get("shape");

    const price = useLocation().search;
    const searchprice = new URLSearchParams(price).get("price");

    const isUpperCase = (searchshape) =>
        searchshape === searchshape.toUpperCase();

    const isLowerCase = (searchshape) =>
        searchshape === searchshape.toLowerCase();

    const capitalize = (searchshape) =>
        searchshape.charAt(0).toUpperCase() +
        searchshape.slice(1).toLowerCase();

    const [count, setCount] = useState(0);
    const navigate = useNavigate();
    const isFetchingRef = useRef(false);

    // GET SETTINGS PRODUCT
    const getDiamondProductsData = async (type, type1, currentPage) => {
        // Prevent concurrent API calls
        if (isFetchingRef.current) {
            return;
        }

        isFetchingRef.current = true;

        var labGown = false;

        if (gettabname === "labgrown") {
            labGown = true;
        }

        //For Price
        var minPrice;
        var maxPrice;

        if (getPricemin === "") {
            minPrice = getpriceRange[0].minPrice;
        } else {
            minPrice = getPricemin;
        }
        if (getPricemax === "") {
            maxPrice = getpriceRange[0].maxPrice;
        } else {
            maxPrice = getPricemax;
        }

        //For Carat
        var minCarat;
        var maxCarat;

        if (getCaratmin === "") {
            minCarat = getDiamondCarat[0].minCarat;
        } else {
            minCarat = getCaratmin;
        }
        if (getCaratmax === "") {
            maxCarat = getDiamondCarat[0].maxCarat;
        } else {
            maxCarat = getCaratmax;
        }

        //For Depth
        var minDepth;
        var maxDepth;

        if (getDepthmin === "") {
            minDepth = getDepth[0].minDepth;
        } else {
            minDepth = getDepthmin;
        }
        if (getDepthmax === "") {
            maxDepth = getDepth[0].maxDepth;
        } else {
            maxDepth = getDepthmax;
        }

        if (getsettingcookies._shopify_ringsetting && !isSettingFilterRelaxed()) {
            var cookieCenterStoneFit = getsettingcookies._shopify_ringsetting[0].centerStoneFit || "";
            var shapeArrayLength = cookieCenterStoneFit.split(",").map(function (s) { return s.trim(); }).filter(Boolean).length;
            if (
                getsettingcookies._shopify_ringsetting[0].centerStoneFit &&
                shapeArrayLength < 2
            ) {
                var cookieshape1 = cookieCenterStoneFit;
                cookieshape = cookieshape1.replace(/\s/g, "");
            } else if (shapeArrayLength < 1) {
                cookieshape = cookieCenterStoneFit;
            } else {
                // Multiple shapes in cookie: use cookie for API unless user clearly filtered to fewer shapes.
                // getshapeselected can miss one shape (e.g. Round) if DiamondShape programmatic clicks fail (casing).
                var selectedLength = (getshapeselected || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean).length;
                var useCookie = getshapeselected === "" || getshapeselected === "," ||
                    selectedLength >= shapeArrayLength || selectedLength === shapeArrayLength - 1;
                cookieshape = useCookie ? cookieCenterStoneFit.replace(/\s/g, "") : getshapeselected;
            }
        } else {
            var cookieshape = getshapeselected;
        }
        // While relaxed, drop a shape that is only there because the setting forced it (keep user picks).
        if (isSettingFilterRelaxed() && getsettingcookies._shopify_ringsetting?.[0]?.centerStoneFit) {
            var settingFit = String(getsettingcookies._shopify_ringsetting[0].centerStoneFit).replace(/\s/g, "");
            if (String(cookieshape || "").replace(/\s/g, "") === settingFit) {
                cookieshape = "";
            }
        }

        try {
            // Match solo DL: use gettabname directly, not effectiveTab
            if (gettabname === "fancycolor") {
                // Build base URL with required parameters
                var url = `${window.initData.data[0].diamondlistapifancy}DealerID=${
                    window.initData.data[0].dealerid
                }&CaratMin=${minCarat}&CaratMax=${maxCarat}&PriceMin=${minPrice}&PriceMax=${maxPrice}`;
                
                // Add optional parameters only if they have values
                if (cookieshape && cookieshape !== "") {
                    url += `&Shape=${cookieshape}`;
                }
                if (getfilledsearch && getfilledsearch !== "") {
                    url += `&DID=${getfilledsearch}`;
                }
                // Only include ClarityId if it has a value
                if (getSelectedClarity && getSelectedClarity !== "") {
                    url += `&ClarityId=${getSelectedClarity}`;
                }
                if (getTablemin && getTablemin !== "") {
                    url += `&TableMin=${getTablemin}`;
                }
                if (getTablemax && getTablemax !== "") {
                    url += `&TableMax=${getTablemax}`;
                }
                // Only include depth if user has explicitly set it (not using defaults)
                if (getDepthmin && getDepthmin !== "") {
                    url += `&DepthMin=${minDepth}`;
                }
                if (getDepthmax && getDepthmax !== "") {
                    url += `&DepthMax=${maxDepth}`;
                }
                if (getSelectedsymmetry && getSelectedsymmetry !== "") {
                    url += `&SymmetryId=${getSelectedsymmetry}`;
                }
                if (getSelectedpolish && getSelectedpolish !== "") {
                    url += `&PolishId=${getSelectedpolish}`;
                }
                if (getSelectedfluore && getSelectedfluore !== "") {
                    url += `&FluorescenceId=${getSelectedfluore}`;
                }
                if (certificateType && certificateType !== "") {
                    url += `&Certificate=${certificateType}`;
                }
                // Only include FancyColor if it has a value
                if (getSelectedfancyColor && getSelectedfancyColor !== "") {
                    url += `&FancyColor=${getSelectedfancyColor}`;
                }
                // Only include intIntensity if it has a value
                if (getSelectedintensity && getSelectedintensity !== "") {
                    url += `&intIntensity=${getSelectedintensity}`;
                }
                
                // Add required parameters
                url += `&OrderBy=${type ? type : getpageordertypeelected || ""}`;
                url += `&OrderType=${type1 ? type1 : getascdescordertypeelected || ""}`;
                url += `&PageNumber=${currentPage ? currentPage : getselectedpageno}`;
                url += `&PageSize=${getselectedpageSize}`;
            } else {
                // Build base URL with required parameters for mined/lab-grown
                var url = `${window.initData.data[0].diamondlistapi}DealerID=${
                    window.initData.data[0].dealerid
                }&CaratMin=${minCarat}&CaratMax=${maxCarat}&PriceMin=${minPrice}&PriceMax=${maxPrice}`;
                
                // Add optional parameters only if they have values
                if (cookieshape && cookieshape !== "") {
                    url += `&Shape=${cookieshape}`;
                }
                if (getSelectedColor && getSelectedColor !== "") {
                    url += `&ColorId=${getSelectedColor}`;
                }
                if (getfilledsearch && getfilledsearch !== "") {
                    url += `&DID=${getfilledsearch}`;
                }
                if (getSelectedClarity && getSelectedClarity !== "") {
                    url += `&ClarityId=${getSelectedClarity}`;
                }
                if (getSelectedCut && getSelectedCut !== "") {
                    url += `&CutGradeId=${getSelectedCut}`;
                }
                if (getTablemin && getTablemin !== "") {
                    url += `&TableMin=${getTablemin}`;
                }
                if (getTablemax && getTablemax !== "") {
                    url += `&TableMax=${getTablemax}`;
                }
                // Only include depth if user has explicitly set it (not using defaults)
                if (getDepthmin && getDepthmin !== "") {
                    url += `&DepthMin=${minDepth}`;
                }
                if (getDepthmax && getDepthmax !== "") {
                    url += `&DepthMax=${maxDepth}`;
                }
                if (getSelectedsymmetry && getSelectedsymmetry !== "") {
                    url += `&SymmetryId=${getSelectedsymmetry}`;
                }
                if (getSelectedpolish && getSelectedpolish !== "") {
                    url += `&PolishId=${getSelectedpolish}`;
                }
                if (getSelectedfluore && getSelectedfluore !== "") {
                    url += `&FluorescenceId=${getSelectedfluore}`;
                }
                if (certificateType && certificateType !== "") {
                    url += `&Certificate=${certificateType}`;
                }
                
                // Add required parameters
                url += `&OrderBy=${type ? type : getpageordertypeelected || ""}`;
                url += `&OrderType=${type1 ? type1 : getascdescordertypeelected || ""}`;
                url += `&PageNumber=${currentPage ? currentPage : getselectedpageno}`;
                url += `&PageSize=${getselectedpageSize}`;
                url += `&IsLabGrown=${labGown}`;
                
                const tabType = labGown ? "LAB GROWN" : "MINED";
            }
            setLoaded(true);
            const res = await fetch(url);
            const settingProduct = await res.json();

            if (settingProduct.diamondList) {
                setDataSettingProduct(settingProduct.diamondList);
            } else {
                setDataSettingProduct([]);
            }

            setProductCount(settingProduct.count);
            if (Number(settingProduct.count) === 0 && settingConstrains(getsettingcookies._shopify_ringsetting)) {
                // Setting shape/carat has no inventory: relax them for listing and search again.
                enableSettingFilterRelax();
                shapeselected("");
                setCaratmin("");
                setCaratmax("");
                setTimeout(() => setSettingRelaxTick((tick) => tick + 1), 0);
            }
            var totalPages = Math.ceil(settingProduct.count / getselectedpageSize);
            setTotalPage(totalPages);
            var offset =
                (currentPage ? currentPage : getselectedpageno - 1) *
                    getselectedpageSize +
                    1;
            setStartPage(offset);
            var end = parseInt(
                currentPage ? currentPage : getselectedpageno * getselectedpageSize
            );
            setEndPage(end);
            setskeltonLoad(true);
            setTimeout(() => {
                setLoaded(false);
            }, 500);
            setloadvariable(true);
        } catch (error) {
            console.error('[API CALL] Error in getDiamondProductsData:', error);
            setLoaded(false);
        } finally {
            isFetchingRef.current = false;
        }
    };

    const shapeName = (shapeName) => {
        shapeselected(shapeName);
        setQuerySearchShape("1");
        setLoaded(true);
    };

    // Define the handler function to handle order type changes
    const handleOrderTypeChange = (selectedOrderType) => {
        // Update the state with the selected order type

        if (selectedOrderType === "Show All Cerificate") {
            setcertificateType("");
        } else {
            setcertificateType(selectedOrderType);
        }
    };

    const cutName = (cutName) => {
        const startCut = cutName[0];
        const endCut = cutName[1] - 1;

        var res = getDiamondCut.filter(function (v) {
            return v.cutId >= parseInt(startCut) && v.cutId <= parseInt(endCut);
        });
        const finalCut = res
            .map(function (m) {
                return m.cutId;
            })
            .join(",");

        if (getSelectedCut !== finalCut) {
            setSelectedCut(finalCut);
            setLoaded(true);
        }
    };

    const inticutname = (cutName) => {
        setinitCut(cutName);
        setLoaded(true);
    };

    const fancyColorName = (colorName) => {
        const startCut = colorName[0];
        const endCut = colorName[1] - 1;
        var res = getFancyColor.filter(function (v) {
            return v.id >= parseInt(startCut) && v.id <= parseInt(endCut);
        });

        const finalfancycolor = res
            .map(function (m) {
                return m.diamondColorName;
            })
            .join(",");

        setSelectedfancyColor(finalfancycolor);
        setLoaded(true);
    };

    const fancyintensityname = (cutName) => {
        const startCut = cutName[0];
        const endCut = cutName[1] - 1;
        var res = getIntensity.filter(function (v) {
            return (
                v.intensityId >= parseInt(startCut) &&
                v.intensityId <= parseInt(endCut)
            );
        });

        const finalIntensity = res
            .map(function (m) {
                return m.intensityName;
            })
            .join(",");

        setSelectedintensity(finalIntensity);
        // setTimeout(() => {
        setLoaded(true);
        // }, 500);
    };

    //POLISH NAME
    const polishName = (polishName) => {
        const startpolish = polishName[0];
        const endpolish = polishName[1] - 1;
        var res = getPolish.filter(function (v) {
            return (
                v.polishId >= parseInt(startpolish) &&
                v.polishId <= parseInt(endpolish)
            );
        });

        const finalpolish = res
            .map(function (m) {
                return m.polishId;
            })
            .join(",");

        setSelectedpolish(finalpolish);
        setTimeout(() => {
            setLoaded(true);
        }, 500);
    };

    const intpolishname = (polishName) => {
        setinitpolish(polishName);
        setLoaded(true);
    };

    //FLUORESCENCE NAME
    const fluoreName = (fluoreName) => {
        const startfluore = fluoreName[0];
        const endfluore = fluoreName[1] - 1;
        var res = getfluorescenceRangeData.filter(function (v) {
            return (
                v.fluorescenceId >= parseInt(startfluore) &&
                v.fluorescenceId <= parseInt(endfluore)
            );
        });

        const finalfluorescence = res
            .map(function (m) {
                return m.fluorescenceId;
            })
            .join(",");

        setSelectedfluore(finalfluorescence);

        setTimeout(() => {
            setLoaded(true);
        }, 500);
    };

    const intfluore = (fluoreName) => {
        setinitfluore(fluoreName);
        setLoaded(true);
    };

    //SYMMETRY NAME
    const symmetryName = (symmetryName) => {
        const startsymmetry = symmetryName[0];
        const endsymmetry = symmetryName[1] - 1;
        var res = getsymmetry.filter(function (v) {
            return (
                v.symmetryId >= parseInt(startsymmetry) &&
                v.symmetryId <= parseInt(endsymmetry)
            );
        });

        const finalsymmetry = res
            .map(function (m) {
                return m.symmetryId;
            })
            .join(",");

        setSelectedsymmetry(finalsymmetry);
        setTimeout(() => {
            setLoaded(true);
        }, 500);
    };

    const initsymmetry = (symmetryName) => {
        setinitsymmetry(symmetryName);
        setLoaded(true);
    };

    const colorName = (colorName) => {
        const startColor = colorName[0];
        const endColor = colorName[1] - 1;
        var res = getDiamondColor.filter(function (v) {
            return (
                v.colorId >= parseInt(startColor) && v.colorId <= parseInt(endColor)
            );
        });

        const finalColor = res
            .map(function (m) {
                return m.colorId;
            })
            .join(",");
        
        // Only update if the value has actually changed
        if (getSelectedColor !== finalColor) {
            setSelectedColor(finalColor);
            setTimeout(() => {
                setLoaded(true);
              }, 500);
        }
    };

    const inticolorname = (colorName) => {
        setinitColor(colorName);
        setLoaded(false);
    };

    const clarityName = (clarityName) => {
        const startColor = clarityName[0];
        const endColor = clarityName[1] - 1;
        var res = getDiamondClarity.filter(function (v) {
            return (
                v.clarityId >= parseInt(startColor) && v.clarityId <= parseInt(endColor)
            );
        });
        const finalClarity = res
            .map(function (m) {
                return m.clarityId;
            })
            .join(",");
        
        // Only update if the value has actually changed
        if (getSelectedClarity !== finalClarity) {
            setSelectedClarity(finalClarity);
            setLoaded(true);
        }
    };

    const inticlarityname = (clarityName) => {
        setinitClarity(clarityName);
        // setLoaded(false);
    };

    const caratSliderValue = (caratValue) => {
        if (
            window.minicarat !== caratValue[0] ||
            window.maxcarat !== caratValue[1]
        ) {
            setCaratmin(caratValue[0]);
            setCaratmax(caratValue[1]);
            window.minicarat = caratValue[0];
            window.maxcarat = caratValue[1];
            setLoaded(true);
        }
    };

    const depthSliderValue = (depthValue) => {
        if (
            window.minidepth !== depthValue[0] ||
            window.maxdepth !== depthValue[1]
        ) {
            setDepthmin(parseInt(depthValue[0]));
            setDepthmax(parseInt(depthValue[1]));
            window.minidepth = depthValue[0];
            window.maxdepth = depthValue[1];
            setLoaded(true);
        }
    };

    const tableSliderValue = (tableValue) => {
        if (
            window.minitable !== tableValue[0] ||
            window.maxtable !== tableValue[1]
        ) {
            setTablemin(parseInt(tableValue[0]));
            setTablemax(parseInt(tableValue[1]));
            window.minitable = tableValue[0];
            window.maxtable = tableValue[1];
            setLoaded(true);
        }
    };

    const priceSliderValue = (priceValue) => {
        if (
            window.miniprice !== priceValue[0] ||
            window.maxprice !== priceValue[1]
        ) {
            setPricemin(parseFloat(priceValue[0]));
            setPricemax(parseFloat(priceValue[1]));
            window.miniprice = priceValue[0];
            window.maxprice = priceValue[1];
            setLoaded(true);
        }
    };

    const pagesizevalue = (sizevalue) => {
        setpageSizeselected(sizevalue);
        setLoaded(true);
    };

    const pageorderbytype = (type) => {
        setpageordertypeelected(type);
        setLoaded(true);
    };

    const ascdesctype = (type1) => {
        // Always refetch: a field change resets to ASC even when ASC was already selected.
        setascdescordertypeelected(type1);
        setLoaded(true);
    };

    const currentpagevalue = (currentPage) => {
        setselectedpageno(currentPage);
        setPageRestoredFromCookie(false); // Reset flag when user manually changes page
        setLoaded(true);
    };

    const searchValueCurrent = (searchval) => {
        if (getfilledsearch !== searchval) {
            setfilledsearch(searchval);
            setLoaded(true);
        }
    };

    const tabvalue = (tabname) => {
        settabname(tabname);
        setLoaded(true);
        setfirsttimeload(true);
        setinitdataload(false);
        setloadvariable(false);

        // Update diamond type cookie when switching tabs
        const typeMap = { mined: "mined", labgrown: "labcreated", fancycolor: "fancydiamonds" };
        setDiamondTypeCookie("shopify_diamondtype", typeMap[tabname] || "mined", { path: "/" });

        getInitFilterDiamondData(window.initData.data[0].dealerid, tabname);
        if (gettabname === "mined") {
            if (
                getsettingcookies._shopify_ringsetting &&
                getsettingcookies._shopify_ringsetting[0].setting_id &&
                !isSettingFilterRelaxed()
            ) {
                shapeselected(
                    getsettingcookies._shopify_ringsetting[0].centerStoneFit
                );
            }
        }
        if (gettabname === "labgrown") {
            if (
                getsettingcookies._shopify_ringsetting &&
                getsettingcookies._shopify_ringsetting[0].setting_id &&
                !isSettingFilterRelaxed()
            ) {
                shapeselected(
                    getsettingcookies._shopify_ringsetting[0].centerStoneFit
                );
            }
        }

        if (gettabname === "fancycolor") {
            if (
                getsettingcookies._shopify_ringsetting &&
                getsettingcookies._shopify_ringsetting[0].setting_id &&
                !isSettingFilterRelaxed()
            ) {
                shapeselected(
                    getsettingcookies._shopify_ringsetting[0].centerStoneFit
                );
            }
        }
    };

    useEffect(() => {
        if (!initdataload) {
            return;
        }

        const filterState = {
            shapeName: getshapeselected,
            selectedCut: getSelectedCut,
            selectedColor: getSelectedColor,
            selectedClarity: getSelectedClarity,
            caratmin: getCaratmin,
            caratmax: getCaratmax,
            pricemin: getPricemin,
            pricemax: getPricemax,
            selectedFlour: getSelectedfluore,
            selectedPolish: getSelectedpolish,
            selectedfancyColor: getSelectedfancyColor,
            selectedfancyIntensity: getSelectedintensity,
            selectedmaxDept: getDepthmax,
            selectedminDept: getDepthmin,
            selectedmaxtable: getTablemax,
            selectedmintable: getTablemin,
            selectedSymmetry: getSelectedsymmetry,
            pageno: getselectedpageno,
            orderType: getascdescordertypeelected,
            orderbytype: getpageordertypeelected,
            searchvalue: getfilledsearch,
            tab: gettabname,
        };

        if (gettabname === "labgrown") {
            setlabcookies("_wpsavedlabgowndiamondfiltercookie", filterState, {
                path: "/",
                maxAge: 604800,
            });
            return;
        }

        if (gettabname === "fancycolor") {
            setfancycookies("_wpsavedfancydiamondfiltercookie", filterState, {
                path: "/",
                maxAge: 604800,
            });
            return;
        }

        setCookie("_wpsavediamondfiltercookie", filterState, {
            path: "/",
            maxAge: 604800,
        });
    }, [
        initdataload,
        gettabname,
        getshapeselected,
        getSelectedCut,
        getSelectedColor,
        getSelectedClarity,
        getCaratmin,
        getCaratmax,
        getPricemin,
        getPricemax,
        getSelectedfluore,
        getSelectedpolish,
        getSelectedfancyColor,
        getSelectedintensity,
        getDepthmax,
        getDepthmin,
        getTablemax,
        getTablemin,
        getSelectedsymmetry,
        getselectedpageno,
        getascdescordertypeelected,
        getpageordertypeelected,
        getfilledsearch,
    ]);

    // Set initial view mode from the admin "default view" setting. WordPress config
    // (GET /reactconfig) names it default_view; default_viewmode is the Shopify key.
    const defaultViewMode = window.initData?.data[0]?.default_view ?? window.initData?.data[0]?.default_viewmode;
    
    // Advanced search collapsed by default
    const [getgrid, setgrid] = useState(true);
    const [getlist, setlist] = useState(false);
    const onOpenGrid = (e) => {
        e.preventDefault();
        setgrid(false);
        setlist(true);
    };
    const onOpenList = (e) => {
        e.preventDefault();
        setlist(false);
        setgrid(true);
    };
    const saveSearch = () => {
        setLoaded(true);
        setTimeout(() => {
            setLoaded(false);
        }, 3000);
    };
    // GET FILTER PRODUCT
    const getInitFilterDiamondData = async (DealerID, tabname) => {
        try {
            // Check if window.initData exists and has the required data
            if (!window.initData || !window.initData.data || !window.initData.data[0]) {
                console.error('window.initData is not properly initialized');
                return;
            }

            let url;
            if (tabname === "fancycolor") {
                if (!window.initData.data[0].filterapifancy) {
                    console.error('filterapifancy API endpoint not configured');
                    return;
                }
                url = `${window.initData.data[0].filterapifancy}DealerID=` + DealerID;
            } else {
                if (!window.initData.data[0].filterapi) {
                    console.error('filterapi API endpoint not configured');
                    return;
                }
                url = `${window.initData.data[0].filterapi}DealerID=` + DealerID;
            }
        
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const acrualRes = await res.json();
            setShowPriceFilter(acrualRes[1][0].isShowPrice);
            setShape(acrualRes[1][0].shapes);
            //DYNAMIC CUT
            if (tabname !== "fancycolor") {
                var cutData = acrualRes[1][0].cutRange;
                var dynamicLastCut = nextSentinelId(cutData, "cutId");
                cutData.push({
                    $id: "000",
                    cutId: dynamicLastCut.toString(),
                    cutName: "Last",
                });
                setDiamondCut(cutData);

                //DYNAMIC COLOR
                var colorData = acrualRes[1][0].colorRange;
                var dynamicLastColor =
                    Number(
                        acrualRes[1][0].colorRange[
                            acrualRes[1][0].colorRange.length - 1
                        ].colorId
                    ) + 1;
                colorData.push({
                    $id: "000",
                    colorId: dynamicLastColor.toString(),
                    colorName: "Last",
                });
                setDiamondColor(colorData);
            }

            if (tabname === "fancycolor") {
                var intensityData = acrualRes[1][0].intensity;
                var dynamicIntensity =
                    Number(
                        acrualRes[1][0].intensity[
                            acrualRes[1][0].intensity.length - 1
                        ].intensityId
                    ) + 1;
                intensityData.push({
                    intensityId: dynamicIntensity.toString(),
                    intensityName: "Last",
                });

                setIntensity(intensityData);

                //DYNAMIC COLOR
                var fancycolorData = acrualRes[1][0].diamondColorRange;
                var dynamicLastColor =
                    Number(
                        acrualRes[1][0].diamondColorRange[
                            acrualRes[1][0].diamondColorRange.length - 1
                        ].id
                    ) + 1;
                fancycolorData.push({
                    id: dynamicLastColor.toString(),
                    diamondColorId: "last",
                    diamondColorImagePath: "",
                    diamondColorName: "Last",
                });
                setFancyColor(fancycolorData);

                // THIS IS TO GET INIT TIME LOAD ALL DATA
                const startInt = acrualRes[1][0].intensity[0].intensityId;
                const endInt =
                    acrualRes[1][0].intensity[
                        acrualRes[1][0].intensity.length - 1
                    ].intensityId;
                var intensityres = acrualRes[1][0].intensity.filter(function (
                    v
                ) {
                    return (
                        v.intensityId >= parseInt(startInt) &&
                        v.intensityId <= parseInt(endInt)
                    );
                });
                const initfinalinten = intensityres
                    .map(function (m) {
                        return m.intensityName;
                    })
                    .join(",");

                // Only restore intensity if cookie exists and doesn't contain "Last" (all values)
                const initSavedIntensity = getfancycookies._wpsavedfancydiamondfiltercookie?.selectedfancyIntensity;
                if (initSavedIntensity && initSavedIntensity !== "" && !initSavedIntensity.includes("Last")) {
                    setSelectedintensity(initSavedIntensity);
                } else {
                    setSelectedintensity("");
                }

                // THIS IS TO GET INIT TIME LOAD ALL DATA
                const startFancy = acrualRes[1][0].diamondColorRange[0].id;
                const endFancy =
                    acrualRes[1][0].diamondColorRange[
                        acrualRes[1][0].diamondColorRange.length - 1
                    ].id;
                var resfancycolor = acrualRes[1][0].diamondColorRange.filter(
                    function (v) {
                        return (
                            v.id >= parseInt(startFancy) &&
                            v.id <= parseInt(endFancy)
                        );
                    }
                );

                const finalfancycd = resfancycolor
                    .map(function (m) {
                        return m.diamondColorName;
                    })
                    .join(",");

                // Only restore fancy color if cookie exists and doesn't contain "Last" (all values)
                const initSavedFancyColor = getfancycookies._wpsavedfancydiamondfiltercookie?.selectedfancyColor;
                if (initSavedFancyColor && initSavedFancyColor !== "" && !initSavedFancyColor.includes("Last")) {
                    setSelectedfancyColor(initSavedFancyColor);
                } else {
                    setSelectedfancyColor("");
                }
                setFancyStatus(true);
            }

            //DYNAMIC COLOR
            var clarityRange = acrualRes[1][0].clarityRange;
            var dynamicLastClarity =
                Number(
                    acrualRes[1][0].clarityRange[
                        acrualRes[1][0].clarityRange.length - 1
                    ].clarityId
                ) + 1;
            clarityRange.push({
                $id: "46",
                clarityId: dynamicLastClarity.toString(),
                clarityName: "Last",
            });
            setDiamondClarity(clarityRange);
            
            // For fancy diamonds, initialize clarity filter values
            // For non-fancy diamonds, cut and color will be initialized separately
            if (tabname === "fancycolor" && clarityRange.length > 0) {
                const startClarity = clarityRange[0].clarityId;
                const endClarity = clarityRange[clarityRange.length - 2].clarityId; // Exclude "Last"
                
                var clarityres = clarityRange.filter(function (v) {
                    return (
                        v.clarityId >= parseInt(startClarity) &&
                        v.clarityId <= parseInt(endClarity)
                    );
                });
                const finalClarity = clarityres
                    .map(function (m) {
                        return m.clarityId;
                    })
                    .join(",");
                
                // Only set if not already set (to prevent overwriting cookie values)
                if (getSelectedClarity === "" || getSelectedClarity === null) {
                    setSelectedClarity(finalClarity);
                }
            }

            //DYNAMIC CARAT RANGE
            setDiamondCarat(acrualRes[1][0].caratRange);
            // setCaratmin(acrualRes[1][0].caratRange[0].minCarat);
            // setCaratmax(acrualRes[1][0].caratRange[0].maxCarat);

            setDepth(acrualRes[1][0].depthRange);
            setTable(acrualRes[1][0].tableRange);
            //polishRange CUT
            var polishRangeData = acrualRes[1][0].polishRange;
            var dynamicLastpolish = nextSentinelId(polishRangeData, "polishId");
            polishRangeData.push({
                $id: "000",
                polishId: dynamicLastpolish.toString(),
                polishName: "Last",
            });
            setPolish(polishRangeData);
            //DYNAMIC CUT
            var fluorescenceRangeData = acrualRes[1][0].fluorescenceRange;
            var fluorescenceRangeDatalast = nextSentinelId(
                fluorescenceRangeData,
                "fluorescenceId"
            );
            fluorescenceRangeData.push({
                $id: "000",
                fluorescenceId: fluorescenceRangeDatalast.toString(),
                fluorescenceName: "Last",
            });
            setfluorescenceRangeData(fluorescenceRangeData);
            //DYNAMIC CUT
            var symmetryRangeData = acrualRes[1][0].symmetryRange;
            var dynamicLastsymmetry = nextSentinelId(symmetryRangeData, "symmetryId");
            symmetryRangeData.push({
                $id: "000",
                symmetryId: dynamicLastsymmetry.toString(),
                symmteryName: "Last",
            });
            setsymmetry(symmetryRangeData);
            setcertificate(acrualRes[1][0].certificateRange);
            setpriceRange(acrualRes[1][0].priceRange);

            // Save currency information from API response
            if (acrualRes[1][0].currencyFrom) {
                window.currencyFrom = acrualRes[1][0].currencyFrom;
            }
            if (acrualRes[1][0].currencySymbol) {
                window.currency = acrualRes[1][0].currencySymbol;
            }

            if (searchprice) {
                setPricemin(acrualRes[1][0].priceRange[0].minPrice);
                setPricemax(searchprice);
                isSetPriceSearch(true);
            }

            window.minicarat = parseInt(acrualRes[1][0].caratRange[0].minCarat);
            window.maxcarat = parseInt(acrualRes[1][0].caratRange[0].maxCarat);

            setTimeout(() => {
                setinitdataload(true);
                // Add extra delay to prevent slider callbacks from firing immediately
                setTimeout(() => {
                }, 500);
            }, 1000);
        } catch (error) {
            console.error('Error in getInitFilterDiamondData:', error);
            // Set default values to prevent crashes
            setShowPriceFilter(false);
            setShape([]);
            setDiamondCut([]);
            setIntensity([]);
        }
    };

    // Fetch navigation data to check if advanced filters should be shown
    const getNavigationData = async () => {
        try {
            const initData = window.initData?.data?.[0];
            if (!initData?.navigationapi || !initData?.dealerid) {
                return;
            }
            const url = `${initData.navigationapi}DealerId=${initData.dealerid}`;
            const res = await fetch(url);
            const actualRes = await res.json();
            if (actualRes?.[0]) {
                const nav = actualRes[0];
                setNavAdvanced(nav.navAdvanced ?? null);
                setNavigationLoaded(true);
            }
        } catch (error) {
            console.error("Error fetching diamond navigation:", error);
        }
    };

    const handleSetBackValue = (item, e) => {
        e.preventDefault();

        // Set diamond back navigation cookie
        var finalSetBackValue = [];
        finalSetBackValue.push({
            shapeName: getshapeselected,
            selectedCut: getSelectedCut,
            selectedColor: getSelectedColor,
            selectedClarity: getSelectedClarity,
            caratmin: getCaratmin,
            caratmax: getCaratmax,
            pricemin: getPricemin,
            pricemax: getPricemax,
            selectedFlour: getSelectedfluore,
            selectedPolish: getSelectedpolish,
            selectedfancyColor: getSelectedfancyColor,
            selectedfancyIntensity: getSelectedintensity,
            selectedmaxDept: getDepthmax,
            selectedminDept: getDepthmin,
            selectedmaxtable: getTablemax,
            selectedmintable: getTablemin,
            selectedSymmetry: getSelectedsymmetry,
            diamondId: item.diamondId,
            pageno: getselectedpageno,
            tab: gettabname,
        });

        setbrowserdiamondcookies(
            "shopify_diamondbackvalue",
            finalSetBackValue,
            {
                path: "/",
                maxAge: 604800,
            }
        );

        var shape = item.shape ? item.shape : "-";
        var carat = item.carat ? item.carat : "-";
        var color = item.color ? item.color : "-";
        var clarity = item.clarity ? item.clarity : "-";
        var cut = item.cut ? item.cut : "-";
        var cert = item.cert ? item.cert : "-";

        // Check if it's a fancy diamond first (priority check)
        // A diamond is fancy if it has isfancy field or fancyColorIntensity
        const isFancyDiamond = (item.isfancy && item.isfancy !== "") || (item.fancyColorIntensity && item.fancyColorIntensity !== "");
        
        if (isFancyDiamond) {
            // Navigate to fancy diamond page (can be lab grown or mined fancy)
            navigate(
                `${RB_BASE}/diamondtools/product/` +
                    shape.replace(/\s+/g, "-").toLowerCase() +
                    "-shape-" +
                    carat.replace(/\s+/g, "-").toLowerCase() +
                    "-carat-" +
                    color.replace(/\s+/g, "-").toLowerCase() +
                    "-color-" +
                    clarity.replace(/\s+/g, "-").toLowerCase() +
                    "-clarity-" +
                    cut.replace(/\s+/g, "-").toLowerCase() +
                    "-cut-" +
                    cert.replace(/\s+/g, "-").toLowerCase() +
                    "-certificate-" +
                    "-sku-" +
                    item.diamondId +
                    "/fancydiamonds"
            );
        } else if (
            item.isLabCreated === true ||
            item.isLabCreated === "true"
        ) {
            // Navigate to lab grown diamond page (non-fancy)
            navigate(
                `${RB_BASE}/diamondtools/product/` +
                    shape.replace(/\s+/g, "-").toLowerCase() +
                    "-shape-" +
                    carat.replace(/\s+/g, "-").toLowerCase() +
                    "-carat-" +
                    color.replace(/\s+/g, "-").toLowerCase() +
                    "-color-" +
                    clarity.replace(/\s+/g, "-").toLowerCase() +
                    "-clarity-" +
                    cut.replace(/\s+/g, "-").toLowerCase() +
                    "-cut-" +
                    cert.replace(/\s+/g, "-").toLowerCase() +
                    "-certificate-" +
                    "-sku-" +
                    item.diamondId +
                    "/labcreated"
            );
        } else {
            // Navigate to mined diamond page (non-fancy, non-lab grown)
            navigate(
                `${RB_BASE}/diamondtools/product/` +
                    shape.replace(/\s+/g, "-").toLowerCase() +
                    "-shape-" +
                    carat.replace(/\s+/g, "-").toLowerCase() +
                    "-carat-" +
                    color.replace(/\s+/g, "-").toLowerCase() +
                    "-color-" +
                    clarity.replace(/\s+/g, "-").toLowerCase() +
                    "-clarity-" +
                    cut.replace(/\s+/g, "-").toLowerCase() +
                    "-cut-" +
                    cert.replace(/\s+/g, "-").toLowerCase() +
                    "-certificate-" +
                    "-sku-" +
                    item.diamondId
            );
        }
    };

    // Fetch navigation data on component mount
    useEffect(() => {
        window.scrollTo(0, 0);
        getNavigationData();
    }, []);

    // Separate useEffect for navigation/tab setting (matches solo DL structure)
    useEffect(() => {
        if (getfirsttimeload === false) {
            if (part === "navlabgrown") {
                settabname("labgrown");
                setDiamondTypeCookie("shopify_diamondtype", "labcreated", { path: "/" });
                setfirsttimeload(true);
            }
            if (part === "navfancycolored") {
                settabname("fancycolor");
                setDiamondTypeCookie("shopify_diamondtype", "fancydiamonds", { path: "/" });
                setfirsttimeload(true);
            }
        }
    }, [gettabname]);

    // Separate useEffect for API calls (matches solo DL structure)
    useEffect(() => {
        // Early return to prevent execution when data is not initialized
        if (initdataload === false) {
            return;
        }

        getDiamondProductsData();
    }, [
        initdataload,
        gettabname,
        getshapeselected,
        getPricemax,
        getPricemin,
        getSelectedCut,
        getSelectedColor,
        getSelectedClarity,
        getCaratmin,
        getCaratmax,
        getDepthmin,
        getDepthmax,
        getTablemin,
        getTablemax,
        getSelectedpolish,
        getSelectedfluore,
        getSelectedsymmetry,
        getselectedpageSize,
        getselectedpageno,
        getpageordertypeelected,
        getascdescordertypeelected,
        getfilledsearch,
        getSelectedfancyColor,
        getSelectedintensity,
        certificateType,
        settingRelaxTick,
    ]);

    // Separate useEffect for cookie restoration (matches solo DL structure)
    useEffect(() => {
        if (loadvarible === false) {
            const restoreTab =
                part === "navlabgrown"
                    ? "labgrown"
                    : part === "navfancycolored"
                    ? "fancycolor"
                    : gettabname;

            if (restoreTab === "mined") {
                if (
                    getsettingcookies._shopify_ringsetting &&
                    getsettingcookies._shopify_ringsetting[0].setting_id &&
                    !isSettingFilterRelaxed()
                ) {
                    shapeselected(
                        getsettingcookies._shopify_ringsetting[0].centerStoneFit
                    );
                }
            }
            if (restoreTab === "labgrown") {
                if (
                    getsettingcookies._shopify_ringsetting &&
                    getsettingcookies._shopify_ringsetting[0].setting_id &&
                    !isSettingFilterRelaxed()
                ) {
                    shapeselected(
                        getsettingcookies._shopify_ringsetting[0].centerStoneFit
                    );
                }
            }
            if (restoreTab === "fancycolor") {
                if (
                    getsettingcookies._shopify_ringsetting &&
                    getsettingcookies._shopify_ringsetting[0].setting_id &&
                    !isSettingFilterRelaxed()
                ) {
                    shapeselected(
                        getsettingcookies._shopify_ringsetting[0].centerStoneFit
                    );
                }
            }

            //THIS IS FOR ON LOAD PAGE CHECK WHICH TAB IS SELECTED ACCORDING TO THAT IT WILL LOADD SAVED SEARCH DATA
            //MINED

            if (restoreTab === "mined" && cookies._wpsavediamondfiltercookie) {
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.shapeName
                ) {
                    shapeselected(cookies._wpsavediamondfiltercookie.shapeName);
                } else {
                    shapeselected("");
                }

                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.selectedCut
                ) {
                    setSelectedCut(
                        cookies._wpsavediamondfiltercookie.selectedCut
                    );
                } else {
                    setSelectedCut("");
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.selectedColor
                ) {
                    setSelectedColor(
                        cookies._wpsavediamondfiltercookie.selectedColor
                    );
                } else {
                    setSelectedColor("");
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.selectedClarity
                ) {
                    setSelectedClarity(
                        cookies._wpsavediamondfiltercookie.selectedClarity
                    );
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.caratmax
                ) {
                    setCaratmax(cookies._wpsavediamondfiltercookie.caratmax);
                } else {
                    setCaratmax("");
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.caratmin
                ) {
                    setCaratmin(cookies._wpsavediamondfiltercookie.caratmin);
                } else {
                    setCaratmin("");
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.pricemax
                ) {
                    setPricemax(cookies._wpsavediamondfiltercookie.pricemax);
                } else {
                    setPricemax("");
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.pricemin
                ) {
                    setPricemin(cookies._wpsavediamondfiltercookie.pricemin);
                } else {
                    setPricemin("");
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.orderType
                ) {
                    setascdescordertypeelected(
                        cookies._wpsavediamondfiltercookie.orderType
                    );
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.orderbytype
                ) {
                    setpageordertypeelected(
                        cookies._wpsavediamondfiltercookie.orderbytype
                    );
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.searchvalue
                ) {
                    setfilledsearch(
                        cookies._wpsavediamondfiltercookie.searchvalue
                    );
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.selectedFlour
                ) {
                    setSelectedfluore(
                        cookies._wpsavediamondfiltercookie.selectedFlour
                    );
                } else {
                    setSelectedfluore("");
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.selectedPolish
                ) {
                    setSelectedpolish(
                        cookies._wpsavediamondfiltercookie.selectedPolish
                    );
                } else {
                    setSelectedpolish("");
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.selectedSymmetry
                ) {
                    setSelectedsymmetry(
                        cookies._wpsavediamondfiltercookie.selectedSymmetry
                    );
                } else {
                    setSelectedsymmetry("");
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.selectedmaxDept
                ) {
                    setDepthmax(
                        cookies._wpsavediamondfiltercookie.selectedmaxDept
                    );
                } else {
                    setDepthmax("");
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.selectedminDept
                ) {
                    setDepthmin(
                        cookies._wpsavediamondfiltercookie.selectedminDept
                    );
                } else {
                    setDepthmin("");
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.selectedmaxtable
                ) {
                    setTablemax(
                        cookies._wpsavediamondfiltercookie.selectedmaxtable
                    );
                } else {
                    setTablemax("");
                }
                if (
                    cookies._wpsavediamondfiltercookie &&
                    cookies._wpsavediamondfiltercookie.selectedmintable
                ) {
                    setTablemin(
                        cookies._wpsavediamondfiltercookie.selectedmintable
                    );
                } else {
                    setTablemin("");
                }
            }
            //LABGOWN
            if (restoreTab === "labgrown") {
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie.shapeName
                ) {
                    shapeselected(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .shapeName
                    );
                } else {
                    shapeselected("");
                }

                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie.selectedCut
                ) {
                    setSelectedCut(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .selectedCut
                    );
                } else {
                    setSelectedCut("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie
                        .selectedColor
                ) {
                    setSelectedColor(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .selectedColor
                    );
                } else {
                    setSelectedColor("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie
                        .selectedClarity
                ) {
                    setSelectedClarity(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .selectedClarity
                    );
                } else {
                    setSelectedClarity("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie.caratmax
                ) {
                    setCaratmax(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .caratmax
                    );
                } else {
                    setCaratmax("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie.caratmin
                ) {
                    setCaratmin(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .caratmin
                    );
                } else {
                    setCaratmin("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie.pricemax
                ) {
                    setPricemax(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .pricemax
                    );
                } else {
                    setPricemax("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie.pricemin
                ) {
                    setPricemin(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .pricemin
                    );
                } else {
                    setPricemin("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie.orderType
                ) {
                    setascdescordertypeelected(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .orderType
                    );
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie.orderbytype
                ) {
                    setpageordertypeelected(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .orderbytype
                    );
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie.searchvalue
                ) {
                    setfilledsearch(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .searchvalue
                    );
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie
                        .selectedFlour
                ) {
                    setSelectedfluore(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .selectedFlour
                    );
                } else {
                    setSelectedfluore("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie
                        .selectedPolish
                ) {
                    setSelectedpolish(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .selectedPolish
                    );
                } else {
                    setSelectedpolish("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie
                        .selectedSymmetry
                ) {
                    setSelectedsymmetry(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .selectedSymmetry
                    );
                } else {
                    setSelectedsymmetry("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie
                        .selectedmaxDept
                ) {
                    setDepthmax(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .selectedmaxDept
                    );
                } else {
                    setDepthmax("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie
                        .selectedminDept
                ) {
                    setDepthmin(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .selectedminDept
                    );
                } else {
                    setDepthmin("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie
                        .selectedmaxtable
                ) {
                    setTablemax(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .selectedmaxtable
                    );
                } else {
                    setTablemax("");
                }
                if (
                    getlabcookies._wpsavedlabgowndiamondfiltercookie &&
                    getlabcookies._wpsavedlabgowndiamondfiltercookie
                        .selectedmintable
                ) {
                    setTablemin(
                        getlabcookies._wpsavedlabgowndiamondfiltercookie
                            .selectedmintable
                    );
                } else {
                    setTablemin("");
                }
            }
            //FANCYCOLOR
            if (restoreTab === "fancycolor") {
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie.shapeName
                ) {
                    shapeselected(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .shapeName
                    );
                } else {
                    shapeselected("");
                }

                // Only restore intensity if cookie exists and doesn't contain "Last" (all values)
                const savedIntensity = getfancycookies._wpsavedfancydiamondfiltercookie?.selectedfancyIntensity;
                if (savedIntensity && savedIntensity !== "" && !savedIntensity.includes("Last")) {
                    setSelectedintensity(savedIntensity);
                } else {
                    // Only set to empty if not already set (preserve user's current selection)
                    if (getSelectedintensity === "" || getSelectedintensity === null || getSelectedintensity.includes("Last")) {
                        setSelectedintensity("");
                    }
                }
                // Only restore fancy color if cookie exists and doesn't contain "Last" (all values)
                const savedFancyColor = getfancycookies._wpsavedfancydiamondfiltercookie?.selectedfancyColor;
                if (savedFancyColor && savedFancyColor !== "" && !savedFancyColor.includes("Last")) {
                    setSelectedfancyColor(savedFancyColor);
                } else {
                    // Only set to empty if not already set (preserve user's current selection)
                    if (getSelectedfancyColor === "" || getSelectedfancyColor === null || getSelectedfancyColor.includes("Last")) {
                        setSelectedfancyColor("");
                    }
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie
                        .selectedClarity
                ) {
                    setSelectedClarity(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .selectedClarity
                    );
                } else {
                    setSelectedClarity("");
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie.caratmax
                ) {
                    setCaratmax(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .caratmax
                    );
                } else {
                    setCaratmax("");
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie.caratmin
                ) {
                    setCaratmin(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .caratmin
                    );
                } else {
                    setCaratmin("");
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie.pricemax
                ) {
                    setPricemax(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .pricemax
                    );
                } else {
                    setPricemax("");
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie.pricemin
                ) {
                    setPricemin(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .pricemin
                    );
                } else {
                    setPricemin("");
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie.orderType
                ) {
                    setascdescordertypeelected(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .orderType
                    );
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie.orderbytype
                ) {
                    setpageordertypeelected(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .orderbytype
                    );
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie.searchvalue
                ) {
                    setfilledsearch(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .searchvalue
                    );
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie
                        .selectedFlour
                ) {
                    setSelectedfluore(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .selectedFlour
                    );
                } else {
                    setSelectedfluore("");
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie
                        .selectedPolish
                ) {
                    setSelectedpolish(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .selectedPolish
                    );
                } else {
                    setSelectedpolish("");
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie
                        .selectedSymmetry
                ) {
                    setSelectedsymmetry(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .selectedSymmetry
                    );
                } else {
                    setSelectedsymmetry("");
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie
                        .selectedmaxDept
                ) {
                    setDepthmax(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .selectedmaxDept
                    );
                } else {
                    setDepthmax("");
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie
                        .selectedminDept
                ) {
                    setDepthmin(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .selectedminDept
                    );
                } else {
                    setDepthmin("");
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie
                        .selectedmaxtable
                ) {
                    setTablemax(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .selectedmaxtable
                    );
                } else {
                    setTablemax("");
                }
                if (
                    getfancycookies._wpsavedfancydiamondfiltercookie &&
                    getfancycookies._wpsavedfancydiamondfiltercookie
                        .selectedmintable
                ) {
                    setTablemin(
                        getfancycookies._wpsavedfancydiamondfiltercookie
                            .selectedmintable
                    );
                } else {
                    setTablemin("");
                }
            }
            //END OF  FIRST TIME LOAD
console.log("getsettingcookies._shopify_ringsetting", getsettingcookies._shopify_ringsetting);
            // Initialize carat values from ring setting cookie if setting is selected
            // This ensures the initial API call uses the correct carat range (same as version 2)
            // Only set if carat values are still empty (no saved filter cookie had carat values)
            const settingCookie = getsettingcookies._shopify_ringsetting?.[0];
            const hasRingCarat = settingCookie?.ringmincarat != null && settingCookie?.ringmincarat !== "" && settingCookie?.ringmaxcarat != null && settingCookie?.ringmaxcarat !== "";
            const hasApiCarat = settingCookie?.centerStoneMinCarat != null && settingCookie?.centerStoneMinCarat !== "" && settingCookie?.centerStoneMaxCarat != null && settingCookie?.centerStoneMaxCarat !== "";
            if (
                getCaratmin === "" &&
                getCaratmax === "" &&
                getsettingcookies._shopify_ringsetting &&
                settingCookie?.setting_id &&
                !isSettingFilterRelaxed() &&
                (hasRingCarat || hasApiCarat)
            ) {
                // Prefer ringmincarat/ringmaxcarat (set by Add Your Diamond from API), fallback to API key names
                let minCarat = hasRingCarat ? settingCookie.ringmincarat : Number(settingCookie.centerStoneMinCarat);
                let maxCarat = hasRingCarat ? settingCookie.ringmaxcarat : Number(settingCookie.centerStoneMaxCarat);

                // Only use settings_carat_ranges when cookie has no API-derived range (legacy path)
                // When we have ringmincarat/ringmaxcarat from Add Your Diamond, keep them to match version 2 / diamond API
                if (
                    !hasRingCarat &&
                    window.initData?.data?.[0]?.settings_carat_ranges &&
                    settingCookie?.caratWeight
                ) {
                    try {
                        const caratRangesData = window.initData.data[0].settings_carat_ranges;
                        if (typeof caratRangesData === 'string' && caratRangesData.trim().startsWith('{')) {
                            const myObject = JSON.parse(caratRangesData);
                            const data = Object.keys(myObject);
                            const goal = parseFloat(settingCookie.caratWeight);
                            const output = data.reduce((prev, curr) =>
                                Math.abs(parseFloat(curr) - goal) < Math.abs(parseFloat(prev) - goal) ? curr : prev
                            );
                            const caratArray = myObject[output];
                            if (caratArray?.["0"] != null && caratArray?.["1"] != null) {
                                minCarat = Number(caratArray["0"]);
                                maxCarat = Number(caratArray["1"]);
                            }
                        }
                    } catch (parseError) {
                        console.warn('Error parsing settings_carat_ranges, using cookie carat:', parseError);
                    }
                }

                setCaratmin(minCarat);
                setCaratmax(maxCarat);
            }
        }

        if (getbrowserdiamondcookies.shopify_diamondbackvalue) {
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0].shapeName
            ) {
                shapeselected(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .shapeName
                );
            } else {
                shapeselected("");
            }

            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0].selectedCut
            ) {
                setSelectedCut(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .selectedCut
                );
            } else {
                setSelectedCut("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                    .selectedColor
            ) {
                setSelectedColor(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .selectedColor
                );
            } else {
                setSelectedColor("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                    .selectedClarity
            ) {
                setSelectedClarity(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .selectedClarity
                );
            } else {
                setSelectedClarity("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0].caratmax
            ) {
                setCaratmax(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .caratmax
                );
            } else {
                setCaratmax("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0].caratmin
            ) {
                setCaratmin(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .caratmin
                );
            } else {
                setCaratmin("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0].pricemax
            ) {
                setPricemax(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .pricemax
                );
            } else {
                setPricemax("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0].pricemin
            ) {
                setPricemin(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .pricemin
                );
            } else {
                setPricemin("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0].orderType
            ) {
                setascdescordertypeelected(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .orderType
                );
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0].orderbytype
            ) {
                setpageordertypeelected(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .orderbytype
                );
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0].searchvalue
            ) {
                setfilledsearch(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .searchvalue
                );
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                    .selectedFlour
            ) {
                setSelectedfluore(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .selectedFlour
                );
            } else {
                setSelectedfluore("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                    .selectedPolish
            ) {
                setSelectedpolish(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .selectedPolish
                );
            } else {
                setSelectedpolish("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                    .selectedSymmetry
            ) {
                setSelectedsymmetry(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .selectedSymmetry
                );
            } else {
                setSelectedsymmetry("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                    .selectedmaxDept
            ) {
                setDepthmax(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .selectedmaxDept
                );
            } else {
                setDepthmax("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                    .selectedminDept
            ) {
                setDepthmin(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .selectedminDept
                );
            } else {
                setDepthmin("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                    .selectedmaxtable
            ) {
                setTablemax(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .selectedmaxtable
                );
            } else {
                setTablemax("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                    .selectedmintable
            ) {
                setTablemin(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .selectedmintable
                );
            } else {
                setTablemin("");
            }
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                    .selectedfancyIntensity
            ) {
                setSelectedintensity(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .selectedfancyIntensity
                );
            } else {
                setSelectedintensity("");
            }

            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                    .selectedfancyColor
            ) {
                setSelectedfancyColor(
                    getbrowserdiamondcookies.shopify_diamondbackvalue[0]
                        .selectedfancyColor
                );
            } else {
                setSelectedfancyColor("");
            }

            // Restore page number from diamond back navigation cookie
            if (
                getbrowserdiamondcookies.shopify_diamondbackvalue &&
                getbrowserdiamondcookies.shopify_diamondbackvalue[0].pageno
            ) {
                setselectedpageno(getbrowserdiamondcookies.shopify_diamondbackvalue[0].pageno);
                setPageRestoredFromCookie(true);
            }

            if (getbrowserdiamondcookies.shopify_diamondbackvalue) {
                setTimeout(() => {
                    removeCookie("shopify_diamondbackvalue", { path: "/" });
                }, 3000);
            }
        }

        // Set loadvariable to true after initial cookie restoration to prevent re-running
        setloadvariable(true);

        //THIS IS TO CHECK COOKIES BASED BUTTON SELECTION
        if (
            getsettingcookies._shopify_ringsetting &&
            getsettingcookies._shopify_ringsetting[0].setting_id
        ) {
            setsettingcookie(true);
        }
        if (
            getdiamondcookies._shopify_diamondsetting &&
            getdiamondcookies._shopify_diamondsetting[0].diamondId
        ) {
            setDiamondCookie(true);
        }
        //END THIS IS TO CHECK COOKIES BASED BUTTON SELECTION

        // COMPARE ITEMS COOKIES CHECKING
        if (
            getcomparecookies._wpsavedcompareproductcookie &&
            getcomparecookies._wpsavedcompareproductcookie !== ""
        ) {
            window.compareproduct = JSON.parse(
                JSON.stringify(getcomparecookies._wpsavedcompareproductcookie)
            );
        }
    }, [gettabname]);

    // Separate useEffect for init data loading (matches solo DL structure)
    useEffect(() => {
        if (initdataload === false) {
            // Check if window.initData exists before accessing it
            if (window.initData && window.initData.data && window.initData.data[0] && window.initData.data[0].dealerid) {
                getInitFilterDiamondData(
                    window.initData.data[0].dealerid,
                    gettabname
                );
            } else {
                console.error('window.initData is not properly initialized, cannot load filter data');
            }
        }

        //THIS IS FOR SELECTED VALUE FROM QUERY STRING IF WE PASS
        if (getQuerySearchShape === "0") {
            if (searchshape) {
                if (
                    isUpperCase(searchshape) === true ||
                    isLowerCase(searchshape) === true
                ) {
                    shapeselected(capitalize(searchshape));
                } else {
                    shapeselected(searchshape);
                }
            }
        }
    }, [initdataload, gettabname, getQuerySearchShape, searchshape]);

    if (skeltonLoad === false) {
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
        } else {
            return (
                <>
                    <style>
                        {`
        .diamond-filter{
          background-color:${window.initData["data"][0].header_colour}; 
        }
        .product-list-viewdata .table thead{
           background-color:${window.initData["data"][0].header_colour}; 
        }
            .diamond-filter .navigation_filter_left .n_filter_left li:hover a{
                color: ${window.initData["data"][0].hover_colour};
            }
            .diamond-filter .navigation_filter_left .n_filter_left li:hover span i{
              color: ${window.initData["data"][0].hover_colour};
            }
            .diamond-filter .save-reset-filter .navigation_right li a:hover{
              color: ${window.initData["data"][0].hover_colour};
            }
            // .shapes ul .shapes_lists .shape_box:hover , .shapes ul .active .shape_box{
            //     background-color: ${window.initData["data"][0].hover_colour};
            // }

            .shapes ul .shapes_lists .shape_box:hover {
              background-color: ${window.initData["data"][0].hover_colour};                 
          }
          .shapes ul .active .shape_box{
              background-color: ${window.initData["data"][0].hover_colour} !important;
          }
          
        .range-slider_diamond .noUi-connect , .range-slider_diamond .noUi-horizontal .noUi-handle{
                background-color: ${window.initData["data"][0].slider_colour};
            }
            .diamond-change-view ul .active a.grid-view-four , .diamond-change-view ul .active a.listview , .diamond-change-view ul li a:hover , .search-bar .search-btn{
              background-color: ${window.initData["data"][0].button_colour};
            }
            .search-product-listing .product-grid-view li.product-listing:hover a{
              color: ${window.initData["data"][0].hover_colour};
            }
            .btn-compare .btn{
               background-color:${window.initData["data"][0].button_colour};
            }
            .product-list-viewdata .table tbody tr:hover{
              background-color:${window.initData["data"][0].hover_colour};
            }
            .ellipsis-data:hover .icon-hover i:hover{
              background-color: ${window.initData["data"][0].hover_colour};
              color: ${window.initData["data"][0].link_colour};                  
              border-radius: 5px;
            }
             .btn:hover{
               background-color: ${window.initData["data"][0].hover_colour} !important;
            }

            @media screen and (max-width: 991px) { 
              .shapes ul .shapes_lists .shape_box:hover {
                  background-color: inherit;
              }
          }
            `}
                    </style>
                    <div className="tool-container">
                        <LoadingOverlay className="_loading_overlay_wrapper">
                            <Loader fullPage loading={loaded} />
                        </LoadingOverlay>

                        <Topheader></Topheader>

                        {getsettingcookie === false &&
                            getDiamondCookie === false && (
                                <div className="breadCumbs">
                                    {DataDiamond.map((item) => (
                                        <Breadcumb Data={item} key={item.key} />
                                    ))}
                                </div>
                            )}

                        {getsettingcookie === true &&
                            getDiamondCookie === false && (
                                <div className="breadCumbs">
                                    {Data.map((item) => (
                                        <Breadcumb Data={item} key={item.key} />
                                    ))}
                                </div>
                            )}

                        {getsettingcookie === false &&
                            getDiamondCookie === true && (
                                <div className="breadCumbs">
                                    {DataDiamond.map((item) => (
                                        <Breadcumb Data={item} key={item.key} />
                                    ))}
                                </div>
                            )}

                        {getsettingcookie === true &&
                            getDiamondCookie === true && (
                                <div className="breadCumbs">
                                    {DataDiamond.map((item) => (
                                        <Breadcumb Data={item} key={item.key} />
                                    ))}
                                </div>
                            )}

                        <div className="diamond-filter">
                            <Filter
                                shapeName={getshapeselected}
                                selectedCut={getSelectedCut}
                                selectedColor={getSelectedColor}
                                selectedClarity={getSelectedClarity}
                                caratmin={getCaratmin}
                                caratmax={getCaratmax}
                                pricemin={getPricemin}
                                pricemax={getPricemax}
                                selectedpagecount={getselectedpageno}
                                orderbytype={getpageordertypeelected}
                                orderType={getascdescordertypeelected}
                                searchvalue={getfilledsearch}
                                selectedminDept={getDepthmin}
                                selectedmaxDept={getDepthmax}
                                selectedmintable={getTablemin}
                                selectedmaxtable={getTablemax}
                                selectedPolish={getSelectedpolish}
                                selectedFlour={getSelectedfluore}
                                selectedSymmetry={getSelectedsymmetry}
                                selectedfancyColor={getSelectedfancyColor}
                                selectedfancyIntensity={getSelectedintensity}
                                callBack={saveSearch}
                                callbacktab={tabvalue}
                            />
                        </div>
                        <div className="filter-main-div">
                            <div className="shapes">
                                <DiamondShape
                                    shapeData={shape}
                                    callBack={shapeName}
                                    selectedShape={getshapeselected}
                                />
                            </div>
                            {gettabname !== "fancycolor" && (
                                <div className="rangeSlider ui-sliders">
                                    <CutSlider
                                        cutSliderData={getDiamondCut}
                                        callBack={cutName}
                                        defaultCut={inticutname}
                                        setSelectedCutData={getSelectedCut}
                                    />
                                    <ColorSlider
                                        colorSliderData={getDiamondColor}
                                        callBack={colorName}
                                        defaultColor={inticolorname}
                                        setSelectedColorData={getSelectedColor}
                                    />
                                </div>
                            )}
                            {gettabname === "fancycolor" &&
                                getFancyStatus === true && (
                                    <div className="rangeSlider ui-sliders">
                                        <FancyColorSlider
                                            fancycolorSliderData={getFancyColor}
                                            callBack={fancyColorName}
                                            setSelectedFancyColorData={
                                                getSelectedfancyColor
                                            }
                                        />
                                        <FancyIntensity
                                            getIntensityData={getIntensity}
                                            callBack={fancyintensityname}
                                            setSelectedIntensityData={
                                                getSelectedintensity
                                            }
                                        />
                                    </div>
                                )}
                            <div className="rangeSlider ui-sliders">
                                <ClaritySlider
                                    claritySliderData={getDiamondClarity}
                                    callBack={clarityName}
                                    defaultClarity={inticlarityname}
                                    setSelectedClarityData={getSelectedClarity}
                                />
                                <div className="slider__diamond">
                                    <div className="slide_left slider-div">
                                        <CaratSlider
                                            caratSliderData={getDiamondCarat}
                                            minCarat={
                                                getsettingcookies._shopify_ringsetting && !isSettingFilterRelaxed()
                                                    ? getsettingcookies
                                                          ._shopify_ringsetting[0]
                                                          .ringmincarat
                                                    : getCaratmin
                                            }
                                            maxCarat={
                                                getsettingcookies._shopify_ringsetting && !isSettingFilterRelaxed()
                                                    ? getsettingcookies
                                                          ._shopify_ringsetting[0]
                                                          .ringmaxcarat
                                                    : getCaratmax
                                            }
                                            callBack={caratSliderValue}
                                            callbacktab={gettabname}
                                        />
                                    </div>
                                    <div className="slide_right slider-div">
                                        {getShowPriceFilter === true && (
                                            <PriceSlider
                                                pricerangeData={getpriceRange}
                                                pricemindata={getPricemin}
                                                pricemaxdata={getPricemax}
                                                callBack={priceSliderValue}
                                                callbacktab={gettabname}
                                                isGetPriceSearch={
                                                    isGetPriceSearch
                                                }
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Shown unless the dealer explicitly disabled it ("0"); WordPress derives the
                                    flag from GetNavigation navAdvanced in GET /reactconfig. */}
                                {(String(
                                    window.initData?.data?.[0]
                                        ?.show_Advance_options_as_Default_in_Diamond_Search ?? ""
                                ) !== "0" || Boolean(navAdvanced)) && (
                                    <div className="advance-slider">
                                        <div
                                            className={`advance-heading ${
                                                getgrid === true ? "active" : ""
                                            }`}
                                        >
                                            <div
                                                className="heading"
                                                onClick={onOpenGrid}
                                            >
                                                <span>
                                                    <i className="fas fa-plus"></i>
                                                </span>
                                                Advance Search
                                            </div>
                                        </div>
                                        <div
                                            className={`advance-search-sliders ${
                                                getlist === true ? "active" : ""
                                            }`}
                                        >
                                            <div
                                                className="advance-heading-div"
                                                onClick={onOpenList}
                                            >
                                                <div className="heading">
                                                    <span>
                                                        <i className="fas fa-minus"></i>
                                                    </span>
                                                    Advance Search
                                                </div>
                                            </div>
                                            <div className="slider__diamond">
                                                <div className="slide_left slider-div">
                                                    <DepthSlider
                                                        depthSliderData={
                                                            getDepth
                                                        }
                                                        depthmin={getDepthmin}
                                                        depthmax={getDepthmax}
                                                        callBack={
                                                            depthSliderValue
                                                        }
                                                        callbacktab={gettabname}
                                                    />
                                                </div>
                                                <div className="slide_right slider-div">
                                                    <TableSlider
                                                        tableSliderData={
                                                            getTable
                                                        }
                                                        tablemin={getTablemin}
                                                        tablemax={getTablemax}
                                                        callBack={
                                                            tableSliderValue
                                                        }
                                                        callbacktab={gettabname}
                                                    />
                                                </div>
                                            </div>
                                            <PolishSlider
                                                polishSliderData={getPolish}
                                                callBack={polishName}
                                                defaultCut={intpolishname}
                                                setSelectedPolishData={
                                                    getSelectedpolish
                                                }
                                            />
                                            <FluorescenceSlider
                                                fluorescenceSliderData={
                                                    getfluorescenceRangeData
                                                }
                                                callBack={fluoreName}
                                                defaultCut={intfluore}
                                                setSelectedFluoreData={
                                                    getSelectedfluore
                                                }
                                            />
                                            <SymmetrySlider
                                                symmetrySliderData={getsymmetry}
                                                callBack={symmetryName}
                                                defaultCut={initsymmetry}
                                                setSelectedSymData={
                                                    getSelectedsymmetry
                                                }
                                            />
                                            {window.initData.data[0]
                                                .show_Certificate_in_Diamond_Search ===
                                                "1" &&
                                                getcertificate && (
                                                    <Certificates
                                                        certificateData={
                                                            getcertificate
                                                        }
                                                        onChangeOrderType={
                                                            handleOrderTypeChange
                                                        }
                                                    />
                                                )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div
                            className="SettingsContainer 1998"
                            id="ringbuilderScrollUp"
                        >
                            <DiamondDetailsListing
                                getDataSettingProductData={
                                    getDataSettingProduct
                                }
                                productCount={getProductCount}
                                pagesize={pagesizevalue}
                                changedpagesize={pagesizevalue}
                                currentpageno={currentpagevalue}
                                currentpagenovalue={getselectedpageno}
                                totalPages={getTotalPage}
                                startPage={getStartPage}
                                endPage={getEndPage}
                                orderbytype={pageorderbytype}
                                orderType={ascdesctype}
                                searchvalue={searchValueCurrent}
                                tabvalue={gettabname}
                                initialViewMode={defaultViewMode}
                                shapeName={getshapeselected}
                                selectedCut={getSelectedCut}
                                selectedColor={getSelectedColor}
                                selectedClarity={getSelectedClarity}
                                caratmin={getCaratmin}
                                caratmax={getCaratmax}
                                pricemin={getPricemin}
                                pricemax={getPricemax}
                                selectedpagecount={getselectedpageno}
                                selectedminDept={getDepthmin}
                                selectedmaxDept={getDepthmax}
                                selectedmintable={getTablemin}
                                selectedmaxtable={getTablemax}
                                selectedPolish={getSelectedpolish}
                                selectedFlour={getSelectedfluore}
                                selectedSymmetry={getSelectedsymmetry}
                                selectedfancyColor={getSelectedfancyColor}
                                selectedfancyIntensity={getSelectedintensity}
                                handleSetBackValue={handleSetBackValue}
                            />
                        </div>
                    </div>
                </>
            );
        }
};

export default DiamondtoolSetting;
