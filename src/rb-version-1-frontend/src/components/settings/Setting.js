import React, { useEffect, useState, useRef } from "react";
import Breadcumb from "../elements/Breadcumb";
import Data from "../elements/data";
import Type from "./settings-element/Type";
import Shape from "./settings-element/Shapes";
import PriceSlider from "./settings-element/PriceSlider";
import Metal from "./settings-element/Metal";
import SettingsProduct from "./settings-element/SettingsProducts";
import Navigation from "./settings-element/Navigation";
import { LoadingOverlay, Loader } from "react-overlay-loader";
import Skeleton from "react-loading-skeleton";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router-dom";
import DataDiamond from "../elements/data-diamond";
import { useNavigate } from "react-router-dom";
import Topheader from "../elements/Topheader";
// import Input_slider from "./settings-element/Input_slider";

const Setting = (props) => {
    const [shape, setShape] = useState([]);
    const [getCollectionData, setCollectionData] = useState([]);
    const [startValue, setstartValue] = useState(parseInt(0));
    const [lastValue, setlastValue] = useState(parseInt(0));
    const [getMetalData, setMetalData] = useState([]);
    const [getDataSettingProduct, setDataSettingProduct] = useState([]);
    const [getshapeselected, shapeselected] = useState("");
    const [getproductselected, productselected] = useState();
    const [getcaratmin, setcaratmin] = useState("");
    const [getcaratmax, setcaratmax] = useState("");
    const [getmetalselected, metalselected] = useState("");
    const [getcollectionselected, collectionselected] = useState("");
    const [getProductCount, setProductCount] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [getselectedpageSize, setpageSizeselected] = useState(
        window.initData?.data?.[0]?.products_pp || "12"
    );
    const [getselectedpriceorder, setselectedpriceorder] = useState("cost+asc");
    const [getselectedpageno, setselectedpageno] = useState("1");
    const [getTotalPage, setTotalPage] = useState(35);
    const [getStartPage, setStartPage] = useState(1);
    const [getEndPage, setEndPage] = useState(12);
    const [skeltonLoad, setskeltonLoad] = useState(false);
    const [getfilledsearch, setfilledsearch] = useState("");
    const [cookies, setCookie] = useCookies(["_wpsaveringfiltercookie"]);
    const [loadvarible, setloadvariable] = useState(false);
    const search = useLocation().search;
    const searchParams = new URLSearchParams(search);
    // Support both new parameter names and old ones for backward compatibility
    const searchshape = searchParams.get("selected_shape") || searchParams.get("shape");
    const searchStyle = searchParams.get("ring_collection") || searchParams.get("style");
    const searchMetalType = searchParams.get("ring_metal") || searchParams.get("metal");

    const [initdataload, setinitdataload] = useState(false);
    const [getpriceRange, setpriceRange] = useState([]);
    const [getbrowsercookies, setbrowsercookies, removeCookie] = useCookies([
        "shopify_ringbackvalue",
    ]);

    //const [delearid, setdelearid] = useState('1089');
    const [getsettingcookies, setsettingcookies] = useCookies([
        "_shopify_ringsetting",
    ]);
    const [getdiamondcookies, setdiamondcookies] = useCookies([
        "_shopify_diamondsetting",
    ]);
    
    // Initialize tab name based on current route
    const location = useLocation();
    const getInitialTabName = () => {
        const pathname = location.pathname;
        if (pathname.includes("/islabsettings/") || pathname.includes("/labgrownsettings")) {
            return "labgrown";
        }
        return "mined";
    };
    const [gettabname, settabname] = useState(() => getInitialTabName());

    const [getDiamondCookie, setDiamondCookie] = useState(false);
    const [getsettingcookie, setsettingcookie] = useState(false);
    const [getShowPriceFilter, setShowPriceFilter] = useState();
    // Ref to prevent duplicate API calls
    const isFilterDataLoading = useRef(false);
    // Ref to track previous collection to detect changes
    const prevCollectionRef = useRef(getcollectionselected);
    const priceDebounceRef = useRef(null);
    // Ref to track if URL parameters have been applied
    const urlParamsApplied = useRef(false);

    const navigate = useNavigate();
    const searchValueCurrent = (searchval) => {
        if (getfilledsearch !== searchval) {
            setfilledsearch(searchval);
            setLoaded(true);
        }
    };

    const currentpagevalue = (currentPage) => {
        setselectedpageno(currentPage);
        setLoaded(true);
    };

    const pagesizevalue = (sizevalue) => {
        setpageSizeselected(sizevalue);
        setLoaded(true);
    };

    const pageorder = (priceorder) => {
        setselectedpriceorder(priceorder);
        setLoaded(true);
    };

    var productUrl = location.pathname;
    var part = productUrl.substring(productUrl.lastIndexOf("/") + 1);

    const shapeName = (shapeName) => {
        if (getshapeselected === shapeName) {
            shapeselected("");
        } else {
            shapeselected(shapeName);
        }
        setLoaded(true);
    };

    const metalName = (metalName) => {
        if (getmetalselected === metalName) {
            metalselected("");
        } else {
            metalselected(metalName);
        }
        setLoaded(true);
    };

    const collectionName = (collectionName) => {
        if (getcollectionselected === collectionName) {
            collectionselected("");
            collectionName = "";
        } else {
            collectionselected(collectionName);
        }
        setLoaded(true);
        // Removed direct call - useEffect will handle it when getcollectionselected changes
    };

    const saveSearch = () => {
        setLoaded(true);
        setTimeout(() => {
            setLoaded(false);
        }, 3000);
    };

    const tabvalue = (tabname) => {
        settabname(tabname);
        getSettingProductsData(tabname);
        setLoaded(true);
    };

    const priceSliderValue = (priceValue) => {
        if (priceDebounceRef.current) {
            clearTimeout(priceDebounceRef.current);
        }

        priceDebounceRef.current = setTimeout(() => {
            if (
                window.miniprice !== priceValue[0] ||
                window.maxprice !== priceValue[1]
            ) {
                const newStartValue = parseFloat(priceValue[0]);
                const newLastValue = parseFloat(priceValue[1]);
                setstartValue(newStartValue);
                setlastValue(newLastValue);
                window.miniprice = newStartValue;
                window.maxprice = newLastValue;
            }
        }, 600);
    };

    // Capitalize String Function
    const CapitalizeFirstLetter = (str) => {
        return str
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    // GET FILTER PRODUCT
    const getInitFilterData = async (DealerID, collectionName) => {
        // Prevent duplicate API calls
        if (isFilterDataLoading.current) {
            return;
        }

        isFilterDataLoading.current = true;
        var islab;
        if (gettabname === "mined") {
            islab = "0";
        }

        if (gettabname === "labgrown") {
            islab = "1";
        }

        try {
            if (collectionName !== "") {
                var url = `${window.initData.data[0].ringfiltersapi}DealerID=${DealerID}&Collection=${collectionName}&IsLabSettingsAvailable=${islab}`;
            } else {
                var url = `${window.initData.data[0].ringfiltersapi}DealerID=${DealerID}&IsLabSettingsAvailable=${islab}`;
            }
            
            const res = await fetch(url);
            const acrualRes = await res.json();
            setShowPriceFilter(acrualRes[1][0].isShowPrice);
            setCollectionData(acrualRes[1][0].collections);
            setShape(acrualRes[1][0].shapes);
            setpriceRange(acrualRes[1][0].priceRange);
            window.miniprice = parseInt(acrualRes[1][0].priceRange[0].minPrice);
            window.maxprice = parseInt(acrualRes[1][0].priceRange[0].maxPrice);
            
            // Save currency information from API response
            if (acrualRes[1][0].currencyFrom) {
                window.currencyFrom = acrualRes[1][0].currencyFrom;
            }
            if (acrualRes[1][0].currencySymbol) {
                window.currency = acrualRes[1][0].currencySymbol;
            }
            
            setinitdataload(true);
            acrualRes[1][0].metalType.forEach(function (item) {
                if (item.metalType.indexOf("K ") > 0) {
                    let startIndex = item.metalType.indexOf("K ");
                    item.metalName = item.metalType.substring(
                        0,
                        startIndex + 1
                    );
                    item.typeName = item.metalType.substring(
                        startIndex + 1,
                        item.metalType.length
                    );
                } else if (item.metalType === "Platinum") {
                    item.metalName = "PT";
                    item.typeName = "Platinum";
                }
            });
            setMetalData(acrualRes[1][0].metalType);
        } catch (error) {
            console.log(error);
        } finally {
            isFilterDataLoading.current = false;
        }
    };

    // GET SETTINGS PRODUCT
    const getSettingProductsData = async (gettabname) => {
        setLoaded(true);
        
        // Determine IsLabSettingsAvailable value
        const isLabSettingsAvailable = gettabname === "labgrown" ? "1" : "0";
        
        // Build base URL with required parameters
        let url = `${window.initData.data[0].mountinglistapi}DealerId=${window.initData.data[0].dealerid}&pageSize=${getselectedpageSize}&pageNumber=${getselectedpageno}&OrderBy=${getselectedpriceorder}&IsLabSettingsAvailable=${isLabSettingsAvailable}`;
        
        // Add optional parameters only if they have values
        if (getshapeselected && getshapeselected !== "") {
            url += `&Shape=${getshapeselected}`;
        }
        
        if (getcollectionselected && getcollectionselected !== "") {
            url += `&Collection=${getcollectionselected}`;
        }
        
        if (getmetalselected && getmetalselected !== "") {
            url += `&MetalType=${getmetalselected}`;
        }
        
        if (getfilledsearch && getfilledsearch !== "") {
            url += `&SID=${getfilledsearch}`;
        }
        
        if (getcaratmin && getcaratmin !== "") {
            url += `&CenterStoneMinCarat=${getcaratmin}`;
        }
        
        if (getcaratmax && getcaratmax !== "") {
            url += `&CenterStoneMaxCarat=${getcaratmax}`;
        }
        
        // For Price - always send min/max once filter API has provided defaults.
        // This ensures the initial listing call includes PriceMin/PriceMax even
        // when the user hasn't adjusted the slider (startValue/lastValue = "").
        if (getpriceRange && getpriceRange.length > 0) {
            const defaultMinPrice = getpriceRange[0].minPrice;
            const defaultMaxPrice = getpriceRange[0].maxPrice;

            const minPrice =
                startValue === "" || startValue === null
                    ? defaultMinPrice
                    : startValue;
            const maxPrice =
                lastValue === "" || lastValue === null
                    ? defaultMaxPrice
                    : lastValue;

            url += `&PriceMin=${minPrice}&PriceMax=${maxPrice}`;
        }
        
        try {
            const res = await fetch(url);

            const settingProduct = await res.json();
            setDataSettingProduct(settingProduct.mountingList);
            setProductCount(settingProduct.count);
            var totalPages = Math.ceil(
                settingProduct.count / getselectedpageSize
            );
            setTotalPage(totalPages);
            var offset = (getselectedpageno - 1) * getselectedpageSize + 1;
            setStartPage(offset);
            var end = parseInt(getselectedpageno * getselectedpageSize);
            setEndPage(end);
            setskeltonLoad(true);
            setloadvariable(true);
        } catch (error) {
            console.log(error);
        } finally {
            setLoaded(false);
        }
    };

    useEffect(() => {
        return () => {
            if (priceDebounceRef.current) {
                clearTimeout(priceDebounceRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Check if current route is lab grown settings
        const currentPath = location.pathname;
        const isLabSettingsPath = currentPath.includes("/islabsettings/");
        
        if (part === "labgrownsettings" || isLabSettingsPath) {
            settabname("labgrown");
            setLoaded(true);
        }

        //THIS IS FOR SAVED SEARCH VALUE LOAD ON PAGE LOAD
        // if (window.initData.data[0].is_api === "false") {
        //     window.location.href = "/collections/ringbuilder-settings";
        // }
        
        // Apply URL parameters first (they take priority over cookies)
        // Only apply once when filter data is loaded
        if (initdataload && !urlParamsApplied.current && loadvarible === false) {
            if (searchshape) {
                const decodedShape = decodeURIComponent(searchshape);
                shapeselected(CapitalizeFirstLetter(decodedShape));
            }
            if (searchStyle) {
                const decodedCollection = decodeURIComponent(searchStyle);
                collectionselected(CapitalizeFirstLetter(decodedCollection));
            }
            if (searchMetalType) {
                const decodedMetal = decodeURIComponent(searchMetalType);
                metalselected(CapitalizeFirstLetter(decodedMetal));
            }
            urlParamsApplied.current = true;
        }
        
        if (loadvarible === false) {
            if (
                getdiamondcookies._shopify_diamondsetting &&
                getdiamondcookies._shopify_diamondsetting[0].diamondId
            ) {
                shapeselected(
                    getdiamondcookies._shopify_diamondsetting[0].centerStone
                );
            }
            if (getbrowsercookies.shopify_ringbackvalue) {
                if (
                    getbrowsercookies.shopify_ringbackvalue &&
                    getbrowsercookies.shopify_ringbackvalue[0].settingId
                ) {
                    productselected(
                        getbrowsercookies.shopify_ringbackvalue[0].settingId
                    );
                }
                // Skip collection if URL parameter exists (URL params take priority)
                if (
                    getbrowsercookies.shopify_ringbackvalue &&
                    getbrowsercookies.shopify_ringbackvalue[0].collection &&
                    !searchStyle
                ) {
                    collectionselected(
                        getbrowsercookies.shopify_ringbackvalue[0].collection
                    );
                }
                // Skip shape if URL parameter exists (URL params take priority)
                if (
                    getbrowsercookies.shopify_ringbackvalue &&
                    getbrowsercookies.shopify_ringbackvalue[0].shape &&
                    !searchshape
                ) {
                    shapeselected(
                        getbrowsercookies.shopify_ringbackvalue[0].shape
                    );
                }
                // Skip metal if URL parameter exists (URL params take priority)
                if (
                    getbrowsercookies.shopify_ringbackvalue &&
                    getbrowsercookies.shopify_ringbackvalue[0].metaltype &&
                    !searchMetalType
                ) {
                    metalselected(
                        getbrowsercookies.shopify_ringbackvalue[0].metaltype
                    );
                }
                if (
                    getbrowsercookies.shopify_ringbackvalue &&
                    getbrowsercookies.shopify_ringbackvalue[0].orderby
                ) {
                    setselectedpriceorder(
                        getbrowsercookies.shopify_ringbackvalue[0].orderby
                    );
                }
                if (
                    getbrowsercookies.shopify_ringbackvalue &&
                    getbrowsercookies.shopify_ringbackvalue[0].pageno
                ) {
                    setselectedpageno(
                        getbrowsercookies.shopify_ringbackvalue[0].pageno
                    );
                }
                if (
                    getbrowsercookies.shopify_ringbackvalue &&
                    getbrowsercookies.shopify_ringbackvalue[0].minprice
                ) {
                    setstartValue(
                        getbrowsercookies.shopify_ringbackvalue[0].minprice
                    );
                }
                if (
                    getbrowsercookies.shopify_ringbackvalue &&
                    getbrowsercookies.shopify_ringbackvalue[0].maxprice
                ) {
                    setlastValue(
                        getbrowsercookies.shopify_ringbackvalue[0].maxprice
                    );
                }
                if (getbrowsercookies.shopify_ringbackvalue) {
                    setTimeout(
                        () =>
                            removeCookie("shopify_ringbackvalue", {
                                path: "/",
                            }),
                        3000
                    );
                }
            } else {
                // Skip collection if URL parameter exists (URL params take priority)
                if (
                    cookies._wpsaveringfiltercookie &&
                    cookies._wpsaveringfiltercookie.collectionName &&
                    !searchStyle
                ) {
                    collectionselected(
                        cookies._wpsaveringfiltercookie.collectionName
                    );
                }
                // Skip shape if URL parameter exists (URL params take priority)
                if (
                    cookies._wpsaveringfiltercookie &&
                    cookies._wpsaveringfiltercookie.shapeName &&
                    !searchshape
                ) {
                    shapeselected(cookies._wpsaveringfiltercookie.shapeName);
                }
                if (
                    cookies._wpsaveringfiltercookie &&
                    cookies._wpsaveringfiltercookie.pagesize
                ) {
                    setpageSizeselected(
                        cookies._wpsaveringfiltercookie.pagesize
                    );
                }
                // Skip metal if URL parameter exists (URL params take priority)
                if (
                    cookies._wpsaveringfiltercookie &&
                    cookies._wpsaveringfiltercookie.metaltype &&
                    !searchMetalType
                ) {
                    metalselected(cookies._wpsaveringfiltercookie.metaltype);
                }
                if (
                    cookies._wpsaveringfiltercookie &&
                    cookies._wpsaveringfiltercookie.orderby
                ) {
                    setselectedpriceorder(
                        cookies._wpsaveringfiltercookie.orderby
                    );
                }
                if (
                    cookies._wpsaveringfiltercookie &&
                    cookies._wpsaveringfiltercookie.pageno
                ) {
                    setselectedpageno(cookies._wpsaveringfiltercookie.pageno);
                }
                if (
                    cookies._wpsaveringfiltercookie &&
                    cookies._wpsaveringfiltercookie.pricemin
                ) {
                    setstartValue(cookies._wpsaveringfiltercookie.pricemin);
                } else {
                    setstartValue("");
                }
                if (
                    cookies._wpsaveringfiltercookie &&
                    cookies._wpsaveringfiltercookie.pricemax
                ) {
                    setlastValue(cookies._wpsaveringfiltercookie.pricemax);
                } else {
                    setlastValue("");
                }
                if (
                    cookies._wpsaveringfiltercookie &&
                    cookies._wpsaveringfiltercookie.searchitem
                ) {
                    setfilledsearch(cookies._wpsaveringfiltercookie.searchitem);
                }
            }
        }

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
        if (
            getdiamondcookies._shopify_diamondsetting &&
            getdiamondcookies._shopify_diamondsetting[0].centerstonemincarat
        ) {
            setcaratmin(
                getdiamondcookies._shopify_diamondsetting[0].centerstonemincarat
            );
        }
        if (
            getdiamondcookies._shopify_diamondsetting &&
            getdiamondcookies._shopify_diamondsetting[0].centerstonemaxcarat
        ) {
            setcaratmax(
                getdiamondcookies._shopify_diamondsetting[0].centerstonemaxcarat
            );
        }

        if (initdataload === false) {
            getInitFilterData(
                window.initData.data[0].dealerid,
                getcollectionselected
            );
            prevCollectionRef.current = getcollectionselected;
        } else {
            // When collection changes after initial load, refresh filter data
            if (prevCollectionRef.current !== getcollectionselected) {
                getInitFilterData(
                    window.initData.data[0].dealerid,
                    getcollectionselected
                );
                prevCollectionRef.current = getcollectionselected;
            }
            getSettingProductsData(gettabname);
        }
    }, [
        initdataload,
        getshapeselected,
        getcollectionselected,
        getselectedpageSize,
        getselectedpriceorder,
        getmetalselected,
        getselectedpageno,
        getfilledsearch,
        startValue,
        lastValue,
        loadvarible,
        getcaratmin,
        getcaratmax,
        getproductselected,
        gettabname,
        location.pathname,
    ]);


    if (skeltonLoad === false) {
        return (
            <>
                <div className="tool-container">
                    <Skeleton height={80} /> <Skeleton />
                    <div className="Skeleton-type">
                        <Skeleton count={9} height={60} />{" "}
                    </div>{" "}
                    <div className="Skeleton-settings">
                        <div className="skeleton-div">
                            <div className="skelton-info">
                                {" "}
                                {/* <h4 className="div-left"><Skeleton /></h4> */}{" "}
                                <div className="div-right">
                                    {" "}
                                    <Skeleton count={8} height={60} />{" "}
                                </div>{" "}
                            </div>{" "}
                        </div>{" "}
                        <div className="skeleton-div">
                            <div className="skelton-info">
                                {" "}
                                {/* <h4 className="div-left"><Skeleton /></h4> */}{" "}
                                <div className="div-right-price">
                                    <Skeleton height={60} />{" "}
                                </div>{" "}
                                <div className="div-right-metal">
                                    <Skeleton height={60} />{" "}
                                </div>{" "}
                            </div>{" "}
                        </div>{" "}
                    </div>{" "}
                    <div className="s_gridview">
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                        </div>{" "}
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                        </div>{" "}
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                        </div>{" "}
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                        </div>{" "}
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                        </div>{" "}
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                        </div>{" "}
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                        </div>{" "}
                        <div className="Skeleton__lists">
                            <Skeleton circle={true} height={150} width={150} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                            <Skeleton height={25} width={200} />{" "}
                        </div>{" "}
                    </div>{" "}
                    <Skeleton />
                </div>{" "}
            </>
        );
    } else {
        return (
            <>
                <style>
                    {`
            .diamond-filter .navigation_filter_left .n_filter_left li:hover a{
                 color:  ${window.initData["data"][0].hover_colour};
            }

            .diamond-filter .navigation_filter_left .n_filter_left li:hover span i{
                 color:  ${window.initData["data"][0].hover_colour};
            }
            .diamond-filter .save-reset-filter .navigation_right li a:hover{
                color:  ${window.initData["data"][0].hover_colour};
            }
            .range-slider_diamond .noUi-connect , .range-slider_diamond .noUi-horizontal .noUi-handle{
               background: ${window.initData["data"][0].slider_colour};
            }
            .metal .metal_lists .metal_box:hover , .metal .metal_lists .active{
              border-bottom-color: ${window.initData["data"][0].hover_colour};
            }
            .change-view ul .active a.grid-view-four, .change-view ul .active a.grid-view-three , .change-view ul li a:hover , .search-bar .search-btn{
               background-color: ${window.initData["data"][0].button_colour};
            }
            .product-pagination .pagination .active .page-link , .product-pagination .pagination li a.page-link:hover{
                  background-color:${window.initData["data"][0].button_colour};
                  border-color: ${window.initData["data"][0].button_colour};
                  color: ${window.initData["data"][0].link_colour};
            }
           .diamond-filter{
             background-color:${window.initData["data"][0].header_colour}; 
           }
            `}
                </style>
                <div className="tool-container">
                    <LoadingOverlay className="_loading_overlay_wrapper">
                        <Loader fullPage loading={loaded} />{" "}
                    </LoadingOverlay>
                    <Topheader> </Topheader>{" "}
                    {getsettingcookie === false &&
                        getDiamondCookie === true && (
                            <div className="breadCumbs">
                                {" "}
                                {DataDiamond.map((item) => (
                                    <Breadcumb Data={item} key={item.key} />
                                ))}{" "}
                            </div>
                        )}
                    {getsettingcookie === true &&
                        getDiamondCookie === false && (
                            <div className="breadCumbs">
                                {" "}
                                {Data.map((item) => (
                                    <Breadcumb Data={item} key={item.key} />
                                ))}{" "}
                            </div>
                        )}
                    {getsettingcookie === false &&
                        getDiamondCookie === false && (
                            <div className="breadCumbs">
                                {" "}
                                {Data.map((item) => (
                                    <Breadcumb Data={item} key={item.key} />
                                ))}{" "}
                            </div>
                        )}
                    {getsettingcookie === true && getDiamondCookie === true && (
                        <div className="breadCumbs">
                            {" "}
                            {Data.map((item) => (
                                <Breadcumb Data={item} key={item.key} />
                            ))}{" "}
                        </div>
                    )}
                    <div className="diamond-filter save-reset-filter">
                        <Navigation
                            collectionName={getcollectionselected}
                            shapeName={getshapeselected}
                            pagesize={getselectedpageSize}
                            orderby={getselectedpriceorder}
                            metaltype={getmetalselected}
                            pageno={getselectedpageno}
                            searchitem={getfilledsearch}
                            pricemin={startValue}
                            pricemax={lastValue}
                            callBack={saveSearch}
                            callbacktab={tabvalue}
                        />{" "}
                    </div>{" "}
                    <div className="Type">
                        <Type
                            typedata={getCollectionData}
                            callBack={collectionName}
                            selectedCollection={getcollectionselected}
                        />
                    </div>{" "}
                    <div className="filter-container">
                        <div className="filter-bg filter-align-left">
                            <div className="setting_shapes">
                                <Shape
                                    shapeData={shape}
                                    callBack={shapeName}
                                    selectedShape={getshapeselected}
                                />{" "}
                            </div>{" "}
                        </div>{" "}
                        <div className="filter-bg filter-align-right">
                            {getShowPriceFilter === true && (
                                <div className="rangeSlider">
                                    <PriceSlider
                                        pricerangeData={getpriceRange}
                                        pricemindata={startValue}
                                        pricemaxdata={lastValue}
                                        callBack={priceSliderValue}
                                    />
                                </div>
                            )}
                            {/* <Input_slider /> */}{" "}
                            <div className="metal">
                                <Metal
                                    metaldata={getMetalData}
                                    callBack={metalName}
                                    selectedMetal={getmetalselected}
                                />{" "}
                            </div>{" "}
                        </div>{" "}
                    </div>{" "}
                    <div
                        className="SettingsContainer"
                        id="ringbuilderSettingScrollUp"
                    >
                        <SettingsProduct
                            getDataSettingProductData={getDataSettingProduct}
                            productCount={getProductCount}
                            pagesize={pagesizevalue}
                            priceascdesc={pageorder}
                            currentpageno={currentpagevalue}
                            currentpagenovalue={getselectedpageno}
                            totalPages={getTotalPage}
                            startPage={getStartPage}
                            endPage={getEndPage}
                            searchvalue={searchValueCurrent}
                            currentCollection={getcollectionselected}
                            currentShape={getshapeselected}
                            currentMinPrice={startValue}
                            currentMaxPrice={lastValue}
                            currentMetalType={getmetalselected}
                            currentpagesize={getselectedpageSize}
                            currentorderby={getselectedpriceorder}
                            getpriceRangedata={getpriceRange}
                            currenttab={gettabname}
                        />{" "}
                    </div>{" "}
                </div>{" "}
            </>
        );
    }
};

export default Setting;
