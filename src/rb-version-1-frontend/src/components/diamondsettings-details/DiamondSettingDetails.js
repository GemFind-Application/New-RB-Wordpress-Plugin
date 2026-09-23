import React, { useEffect, useState, useMemo } from "react";
import Breadcumb from "../elements/Breadcumb";
import Topheader from "../elements/Topheader";
import Data from "../elements/data";
import { useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import DiamondProductGallary from "./diamondsettings-element/DiamondProductGallary";
import DiamondProductInformation from "./diamondsettings-element/DiamondProductInformation";
import { Modal } from "react-responsive-modal";
import { LoadingOverlay, Loader } from "react-overlay-loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCookies } from "react-cookie";
import DataDiamond from "../elements/data-diamond";
import DiamondDetailsListing from "./diamondsettings-element/DiamondDetailsListing";
import { useNavigate } from "react-router-dom";
import { diamondService } from "../../Services";

const DiamondSettingDetails = () => {
    const [openModel, setOpenModel] = useState(false);
    const [openDelearModel, setOpenDelearModel] = useState(false);
    const location = useLocation();
    var productUrl = location.pathname;

    const isSlashPresentLab = productUrl.includes("labcreated");
    const isSlashPresentFancy = productUrl.includes("fancydiamonds");

    if (isSlashPresentLab === true || isSlashPresentFancy === true) {
        var getsku = productUrl.substring(productUrl.lastIndexOf("-") + 1);

        // console.log(getsku);

        var sku = getsku.split("/");

        var part = sku[0];

        var type = productUrl.substring(productUrl.lastIndexOf("/") + 1);

        // console.log(sku[0]);
    } else {
        var part = productUrl.substring(productUrl.lastIndexOf("-") + 1);
    }

    const [getCurrentProductId, setCurrentProductId] = useState(part);

    const [getIslab, setIslab] = useState(isSlashPresentLab);
    const [getIsFancy, setIsFancy] = useState(isSlashPresentFancy);

    // Calculate diamond type based on fancy and lab status
    // useMemo ensures this recalculates whenever getIsFancy or getIslab changes
    const diamondType = useMemo(() => {
        if (getIsFancy === true && getIslab === false) {
            return "fancydiamonds";
        } else if (getIsFancy === false && getIslab === true) {
            return "labcreated";
        } else {
            return "mined";
        }
    }, [getIsFancy, getIslab]);

    const [skeltonLoad, setskeltonLoad] = useState(false);
    const [getProductData, setProductData] = useState("");
    var selectedmetal = productUrl.substring(productUrl.lastIndexOf("/") + 1);
    const [geterror, seterror] = useState([""]);
    const [loaded, setLoaded] = useState(false);
    const [getsettingcookies, setsettingcookies] = useCookies([
        "_shopify_ringsetting",
    ]);
    const [getdiamondcookies, setdiamondcookies] = useCookies([
        "_shopify_diamondsetting",
    ]);

    const [getdiamondbackvalue, setdiamondbackvalue] = useCookies([
        "shopify_diamondbackvalue",
    ]);

    const [getDiamondTypeCookie, setDiamondTypeCookie] = useCookies([
        "shopify_diamondtype",
    ]);

    const [getDiamondCookie, setDiamondCookie] = useState(false);
    const [getsettingcookie, setsettingcookie] = useState(false);
    const [getDataSettingProduct, setDataSettingProduct] = useState([]);
    const [getProductCount, setProductCount] = useState("");
    const [getcaratWeight, setcaratWeight] = useState("");
    const [getColorId, setColorId] = useState("");
    const [getCertificate, setCertificate] = useState("");
    const [getLabgown, setLabgown] = useState(false);
    const [getTotalPage, setTotalPage] = useState(35);
    const [getStartPage, setStartPage] = useState(1);
    const [getEndPage, setEndPage] = useState(12);
    const [getShape, setShape] = useState("");
    const [getminprice, setminprice] = useState("");
    const [getselectedpageSize, setpageSizeselected] = useState("20");
    const [getselectedpageno, setselectedpageno] = useState("1");
    const [getpageordertypeelected, setpageordertypeelected] = useState("");
    const [getascdescordertypeelected, setascdescordertypeelected] =
        useState("");
    const [getFancyColor, setFancyColor] = useState("");
    const [getFancyColordata, setFancyColordata] = useState("");
    const [getFancyIntensitydata, setFancyIntensitydata] = useState("");
    const [loadvarible, setloadvariable] = useState(false);
    const [getyourpassword, setyourpassword] = useState("");
    const [initdataload, setinitdataload] = useState(false);
    const [initdataloadsimilar, setinitdataloadsimilar] = useState(false);
    const [getpriceRange, setpriceRange] = useState([]);
    const [getPricemin, setPricemin] = useState("");
    const [getPricemax, setPricemax] = useState("");
    const [getdepthRange, setdepthRange] = useState([]);
    const [getDepthmin, setDepthmin] = useState("");
    const [getDepthmax, setDepthmax] = useState("");
    const [gettableRange, settableRange] = useState([]);
    const [getTablemin, setTablemin] = useState("");
    const [getTablemax, setTablemax] = useState("");
    const [getClarity, setClarity] = useState("");
    const [getCut, setCut] = useState("");
    const [getSymmetry, setSymmetry] = useState("");
    const [getPolish, setPolish] = useState("");
    const [getFluorescence, setFluorescence] = useState("");
    const [getCaratRange, setCaratRange] = useState([]);
    const [getJCOptions, setJCOptions] = useState(null);

    const navigate = useNavigate();

    const pageorderbytype = (type) => {
        setpageordertypeelected(type);
        setLoaded(true);
    };

    const handlechangedpagesize = (sizevalue) => {
        setpageSizeselected(sizevalue);
        setLoaded(true);
    };

    const ascdesctype = (type1) => {
        if (getascdescordertypeelected !== type1) {
            setascdescordertypeelected(type1);
            setLoaded(true);
        }
    };

    const currentpagevalue = (currentPage) => {
        setselectedpageno(currentPage);
        setLoaded(true);
    };

    //Internal Storage
    const handleYourpassword = (event) => {
        setyourpassword(event.target.value);
    };

    const handleintstorageSubmit = async (e) => {
        e.preventDefault();
        setLoaded(true);
        let errors = {};
        let formIsValid = true;

        //Validation

        //Name
        if (getyourpassword === "") {
            errors["yourpassword"] = "Please enter your password";
            formIsValid = false;
        }

        if (formIsValid == false) {
            console.log(errors);
            seterror(errors);
            setLoaded(false);
            return;
        }

        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                DealerPass: getyourpassword,
                DealerID: window.initData.data[0].dealerid,
            }),
        };
        try {
            const res = await fetch(
                `${window.initData.data[0].dealerauthapi}`,
                requestOptions
            );
            // 200 on success, 401 on a bad password. The body comes back as
            // text/plain, so parsing it as JSON throws — gate on the status.
            if (res.ok) {
                setOpenDelearModel(true);
            } else {
                toast("User is not authenticated");
            }
            setOpenModel(false);
            setLoaded(false);
        } catch (error) {
            console.log(error);
            setLoaded(false);
        }
    };

    const getProductDetails = async (DealerID, productId) => {

        try {
            if (getIsFancy === true) {
                var url = `${window.initData.data[0].diamonddetailapi}DealerID=${DealerID}&DID=${productId}&IsFancy=${getIsFancy}`;
            } else {
                var url = `${window.initData.data[0].diamonddetailapi}DealerID=${DealerID}&DID=${productId}&IsLabGrown=${getIslab}`;
            }

            const res = await fetch(url);

            const productDetails = await res.json();

            setProductData(productDetails);
            setShape(productDetails.shape);
            setcaratWeight(productDetails.caratWeight);
            setminprice(productDetails.fltPrice);
            setColorId(productDetails.colorID);
            setCertificate(productDetails.certificate);
            setLabgown(productDetails.isLabCreated);
            setFancyColordata(productDetails.color);
            setClarity(productDetails.clarity);
            setCut(productDetails.cut);
            setFancyColor(productDetails.fancyColorIntensity);
            setFancyIntensitydata(productDetails.fancyColorIntensity);
            setSymmetry(productDetails.symmetry);
            setPolish(productDetails.polish);
            setFluorescence(productDetails.fluorescence);
            setskeltonLoad(true);
            setinitdataload(true);
            // WordPress: JewelCloud view-tracking pingback removed in 1.0.2 (see readme changelog).
        } catch (error) {
            console.log(error);
        }
    };

    const getInitFilterDiamondData = async (DealerID) => {

        try {
            if (getFancyColor !== "") {
                var url =
                    `${window.initData.data[0].filterapifancy}DealerID=` +
                    DealerID;
            } else {
                var url =
                    `${window.initData.data[0].filterapi}DealerID=` + DealerID;
            }

            const res = await fetch(url);
            const acrualRes = await res.json();
            //Price Range
            setpriceRange(acrualRes[1][0].priceRange);
            // setPricemin(acrualRes[1][0].priceRange[0].minPrice);
            // setPricemax(acrualRes[1][0].priceRange[0].maxPrice);

            //Depth Range
            setdepthRange(acrualRes[1][0].depthRange);
            setDepthmin(acrualRes[1][0].depthRange[0].minDepth);
            setDepthmax(acrualRes[1][0].depthRange[0].maxDepth);

            //Table Range
            settableRange(acrualRes[1][0].tableRange);
            setTablemin(acrualRes[1][0].tableRange[0].minTable);
            setTablemax(acrualRes[1][0].tableRange[0].maxTable);

            setinitdataloadsimilar(true);
        } catch (error) {
            console.log(error);
        }
    };

    const getDiamondsJCOptions = async (DealerID) => {
        try {
            const options = await diamondService.getDiamondsJCOptions(DealerID);
            setJCOptions(options);
        } catch (error) {
            console.error('❌ [API ERROR] getDiamondsJCOptions failed:', error);
            // Set to null on error so component can fallback to window.initData
            setJCOptions(null);
        }
    };

    const getsimilarDiamondProductsData = async () => {
        var labGown = false;

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

        try {
            // Initialize default carat values
            var centerstonemincarat = 0.1; // Default minimum carat
            var centerstonemaxcarat = 5.0;  // Default maximum carat

            if (window.initData.data[0].settings_carat_ranges) {
                // Check if the data is valid JSON before parsing
                const caratRangesData = window.initData.data[0].settings_carat_ranges;
                if (typeof caratRangesData === 'string' && caratRangesData.trim().startsWith('{')) {
                    try {
                        var myObject = JSON.parse(caratRangesData);
                        var data = Object.keys(myObject);

                        const goal = getcaratWeight;

                        const output = data.reduce((prev, curr) =>
                            Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
                        );

                        var caratArray = myObject[output];

                        centerstonemincarat = Number(caratArray["0"]);
                        centerstonemaxcarat = Number(caratArray["1"]);
                    } catch (parseError) {
                        console.warn('Error parsing carat ranges JSON:', parseError);
                        // Keep default values
                    }
                } else {
                    console.warn('Invalid carat ranges data format:', caratRangesData);
                    // Keep default values
                }
            }

            if (getFancyColor === "") {
                var url = `${window.initData.data[0].diamondlistapi}DealerID=${window.initData.data[0].dealerid}&Shape=${getShape}&PriceMin=${minPrice}&PriceMax=${maxPrice}&CaratMin=${centerstonemincarat}&CaratMax=${centerstonemaxcarat}&Certificate=${getCertificate}&OrderBy=${getpageordertypeelected}&OrderType=${getascdescordertypeelected}&PageNumber=${getselectedpageno}&PageSize=${getselectedpageSize}&IsLabGrown=${getLabgown}`;
            } else {
                var url = `${window.initData.data[0].diamondlistapifancy}DealerID=${window.initData.data[0].dealerid}&Shape=${getShape}&PriceMin=${minPrice}&PriceMax=${maxPrice}&CaratMin=${centerstonemincarat}&CaratMax=${centerstonemaxcarat}&TableMin=${getTablemin}&TableMax=${getTablemax}&DepthMin=${getDepthmin}&DepthMax=${getDepthmax}&Certificate=${getCertificate}&OrderBy=${getpageordertypeelected}&OrderType=${getascdescordertypeelected}&PageNumber=${getselectedpageno}&PageSize=${getselectedpageSize}&IsLabGrown=${getLabgown}`;
            }

            const res = await fetch(url);
            const settingProduct = await res.json();
            
            setDataSettingProduct(settingProduct.diamondList);
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
            setLoaded(false);
        } catch (error) {
            console.log(error);
        }
    };

    // Effect 1: Initial load and cookie check (runs once on mount)
    useEffect(() => {
        window.scrollTo(0, 0);
        
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
        
        setDiamondTypeCookie("shopify_diamondtype", diamondType, { path: "/" });
    }, []); // Empty dependency - runs once on mount

    // Effect 2: Fetch product details (runs once)
    useEffect(() => {
        let isMounted = true;

        if (initdataload === false && window.initData?.data?.[0]?.dealerid) {
            getProductDetails(
                window.initData.data[0].dealerid,
                getCurrentProductId
            );
            if (isMounted) {
                setinitdataload(true); // ✅ CRITICAL: Set to true to prevent re-calling
            }
        }

        return () => {
            isMounted = false;
        };
    }, [initdataload, getCurrentProductId]); // Only these dependencies

    // Effect 3: Fetch filter data (runs after product details loaded)
    useEffect(() => {
        let isMounted = true;

        if (initdataload === true && initdataloadsimilar === false && window.initData?.data?.[0]?.dealerid) {
            getInitFilterDiamondData(window.initData.data[0].dealerid);
            if (isMounted) {
                setinitdataloadsimilar(true); // ✅ CRITICAL: Set to true to prevent re-calling
            }
        }

        return () => {
            isMounted = false;
        };
    }, [initdataload, initdataloadsimilar]); // Only these dependencies

    // Effect 4: Fetch similar diamonds (runs when filters change or pagination changes)
    useEffect(() => {
        // Only fetch similar diamonds if filter data has been loaded (getpriceRange exists)
        if (initdataloadsimilar === true && getpriceRange && getpriceRange.length > 0) {
            getsimilarDiamondProductsData();
        } else if (initdataloadsimilar === true) {
        }
    }, [
        initdataloadsimilar,
        getpriceRange,
        getselectedpageno,
        getselectedpageSize,
        getpageordertypeelected,
        getascdescordertypeelected,
        getPricemin,
        getPricemax,
    ]); // Only pagination and user-controlled filters

    // Effect 5: Fetch JC Options (runs once on mount)
    useEffect(() => {
        if (window.initData?.data?.[0]?.dealerid) {
            getDiamondsJCOptions(window.initData.data[0].dealerid);
        }
    }, []); // Empty - runs once on mount

    if (skeltonLoad == false) {
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
                                <div className="div-right2">
                                    {" "}
                                    <Skeleton height={300} />
                                </div>
                            </div>
                        </div>
                        <div className="skeleton-div">
                            <div className="skelton-info">
                                {/* <h4 className="div-left"><Skeleton /></h4> */}
                                <div className="div-right-price">
                                    <Skeleton height={40} />
                                    <Skeleton height={60} />
                                    <Skeleton height={30} width={200} />
                                    <Skeleton height={30} width={200} />
                                    <Skeleton height={30} width={200} />
                                    <Skeleton height={20} />
                                    <Skeleton height={40} />
                                    <div className="div-inner">
                                        <div className="div-skelton-inner">
                                            {" "}
                                            <Skeleton height={40} />
                                        </div>
                                        <div className="div-skelton-inner">
                                            {" "}
                                            <Skeleton height={40} />
                                        </div>
                                    </div>
                                    <Skeleton />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Skeleton />
                </div>
            </>
        );
    } else {
        return (
            <>
                {/* <ToastContainer
          position="bottom-center"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        /> */}
                <style>
                    {`.product-info .product-controller ul li a:hover{
                color: ${window.initData["data"][0].hover_colour};
            }
            .product-info .product-controller ul li a:hover span i{
              background-color:${window.initData["data"][0].hover_colour};
               color: ${window.initData["data"][0].link_colour};
            }
            .product-info .diamond-tryon .btn-diamond , .btn-tryon{
              background-color:${window.initData["data"][0].button_colour};
            }
            .diamond-change-view ul li a:hover{
               background-color:${window.initData["data"][0].hover_colour};
            }
            
            .diamond-change-view ul .active a.listview , .diamond-change-view ul .active a.grid-view-four{
                background-color:${window.initData["data"][0].button_colour};
            }
            .product-list-viewdata .table thead {
            background-color:${window.initData["data"][0].header_colour};
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

                    {getsettingcookie === true && getDiamondCookie === true && (
                        <div className="breadCumbs">
                            {DataDiamond.map((item) => (
                                <Breadcumb Data={item} key={item.key} />
                            ))}
                        </div>
                    )}

                    <div className="product-info">
                        <div className="product-info__box">
                            <div className="product-info__image diamond-product-gallary">
                                <DiamondProductGallary
                                    productDetailsData={getProductData}
                                />
                            </div>
                            <div className="internam-use">
                                <p>
                                    Internal use Only:{" "}
                                    <a
                                        href="javascript:;"
                                        onClick={() => setOpenModel(true)}
                                    >
                                        Click Here
                                    </a>{" "}
                                </p>
                                <Modal
                                    open={openModel}
                                    onClose={() => setOpenModel(false)}
                                    center
                                    classNames={{
                                        overlay: "popup_Overlay",
                                        modal: "popup-internal-form",
                                    }}
                                >
                                    <LoadingOverlay className="_loading_overlay_wrapper">
                                        <Loader fullPage loading={loaded} />
                                    </LoadingOverlay>
                                    <div className="internal-use-form">
                                        <form
                                            className="internaluseform"
                                            id="internaluseform"
                                            onSubmit={handleintstorageSubmit}
                                        >
                                            <input
                                                type="password"
                                                id="auth_password"
                                                name="password"
                                                value={getyourpassword}
                                                onChange={handleYourpassword}
                                                placeholder="Enter Your Gemfind Password"
                                            />
                                            <p> {geterror.yourpassword} </p>

                                            <button
                                                type="submit"
                                                title="Submit"
                                                className="btn"
                                            >
                                                <span>Submit</span>
                                            </button>
                                        </form>
                                    </div>
                                </Modal>

                                <Modal
                                    open={openDelearModel}
                                    onClose={() => setOpenDelearModel(false)}
                                    center
                                    classNames={{
                                        overlay: "popup_Overlay",
                                        modal: "popup_diamond-product",
                                    }}
                                >
                                    <div className="gf-rb-v1-vendor-info">
                                        <div className="diamond-information">
                                            <div className="spacification-info">
                                                <h2>Vendor Information</h2>
                                            </div>
                                            <ul>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>Dealer Name</p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.retailerName || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>Dealer Company</p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.retailerCompany || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>Dealer City/State</p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.retailerCity || "-"}
                                                            /
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.retailerState || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>
                                                            Dealer Contact No.
                                                        </p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.retailerContactNo || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>Dealer Email</p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.retailerEmail || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>
                                                            Dealer Lot number of
                                                            the item
                                                        </p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.retailerLotNo || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>
                                                            Dealer Stock number
                                                            of the item
                                                        </p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.retailerStockNo || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>Wholesale Price</p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {window.currency}
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.wholesalePrice || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>Third Party</p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.thirdParty || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>Diamond Id</p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData.diamondId
                                                                ? getProductData.diamondId
                                                                : "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>Seller Name</p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.sellerName || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>Seller Address</p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.sellerAddress || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>Dealer Fax</p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.retailerFax || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="diamonds-details-title">
                                                        <p>Dealer Address</p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData
                                                                .retailerInfo
                                                                ?.retailerAddress || "-"}
                                                        </p>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </Modal>
                            </div>
                        </div>
                        <div className="product-info__detail">
                            <DiamondProductInformation
                                productDetailsData={getProductData}
                                jcOptions={getJCOptions}
                                diamondType={diamondType}
                            />
                        </div>
                    </div>
                    {/* <div
                        className="SettingsContainer"
                        id="diamondDetailScrollUp"
                    >
                        <DiamondDetailsListing
                            getDataSettingProductData={getDataSettingProduct}
                            productCount={getProductCount}
                            pagesize={getselectedpageSize}
                            changedpagesize={handlechangedpagesize}
                            currentpageno={currentpagevalue}
                            currentpagenovalue={getselectedpageno}
                            isDetailsPage={true}
                            totalPages={getTotalPage}
                            startPage={getStartPage}
                            endPage={getEndPage}
                            orderbytype={pageorderbytype}
                            orderType={ascdesctype}
                            tabvalue={getFancyColor}
                        />
                    </div> */}
                </div>
            </>
        );
    }
};

export default DiamondSettingDetails;
