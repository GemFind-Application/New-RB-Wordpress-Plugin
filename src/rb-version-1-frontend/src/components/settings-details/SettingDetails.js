import React, { useEffect, useState } from "react";
import Breadcumb from "../elements/Breadcumb";
import Topheader from "../elements/Topheader";
import Data from "../elements/data";
import ProductGallary from "./settingsdetails-element/ProductGallary";
import ProductInformation from "./settingsdetails-element/ProductInformation";
import { useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import DataDiamond from "../elements/data-diamond";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Modal from "react-responsive-modal";
import { LoadingOverlay, Loader } from "react-overlay-loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { diamondService } from "../../Services";
import { jcBase } from '../../wp/wpEnv';

const SettingDetails = () => {
    const location = useLocation();
    var productUrl = location.pathname;
    var stoneSize = [];
    var part = productUrl.substring(productUrl.lastIndexOf("-") + 1);
    const [getCurrentProductId, setCurrentProductId] = useState(part);
    const [getProductData, setProductData] = useState("");
    const [getselectedStone, setselectedStone] = useState("");
    const [getselectedSideStone, setselectedSideStone] = useState("");

    const [skeltonLoad, setskeltonLoad] = useState(false);
    var selectedmetal = productUrl.substring(productUrl.lastIndexOf("/") + 1);
    const [getsettingcookies, setsettingcookies] = useCookies([
        "_shopify_ringsetting",
    ]);
    const [getdiamondcookies, setdiamondcookies] = useCookies([
        "_shopify_diamondsetting",
    ]);
    const [getDiamondCookie, setDiamondCookie] = useState(false);
    const [getsettingcookie, setsettingcookie] = useState(false);
    const navigate = useNavigate();
    const [getstonesizedata, setstonesizedata] = useState([]);
    const [openModel, setOpenModel] = useState(false);
    const [openDelearModel, setOpenDelearModel] = useState(false);
    const [geterror, seterror] = useState([""]);
    const [loaded, setLoaded] = useState(false);
    const [getyourpassword, setyourpassword] = useState("");
    const [getJCOptions, setJCOptions] = useState(null);
    const [getDiamondNavigation, setDiamondNavigation] = useState(null);

    const getProductDetails = async (DealerID, productId) => {
        try {
            // Reset loading state to show skeleton during fetch
            setskeltonLoad(false);

            const res = await fetch(
                `${window.initData.data[0].mountinglistapifancy}DealerID=${DealerID}&SID=${productId}`
            );

            const productDetails = await res.json();
            setProductData(productDetails);

            var findConfigStone = productDetails.configurableProduct ? productDetails.configurableProduct.filter(
                function (v) {
                    return v.gfInventoryId == productId;
                }
            ) : [];

            if (findConfigStone.length > 0) {
                setselectedStone(findConfigStone[0].centerStoneSize);
                setselectedSideStone(findConfigStone[0].sideStoneQuality);
            }

            // Reset stoneSize array to prevent stale data
            var stoneSize = [];
            const stoneItems = productDetails.configurableProduct ? productDetails.configurableProduct.map((val) => {
                if (
                    productDetails.metalType !== "" &&
                    productDetails.sideStoneQuality.length !== 0
                ) {
                    if (
                        productDetails.metalType
                            .replace(/\s+/g, "-")
                            .toLowerCase() ===
                        val.metalType.replace(/\s+/g, "-").toLowerCase()
                    ) {
                        stoneSize.push({
                            type: val.metalType,
                            configid: val.gfInventoryId,
                            stonesize: val.centerStoneSize,
                            sidestone: val.sideStoneQuality,
                        });
                    }
                } else {
                    if (
                        productDetails.metalType
                            .replace(/\s+/g, "-")
                            .toLowerCase() ===
                        val.metalType.replace(/\s+/g, "-").toLowerCase()
                    ) {
                        stoneSize.push({
                            type: val.metalType,
                            configid: val.gfInventoryId,
                            stonesize: val.centerStoneSize,
                        });
                    }
                }
            }) : [];
            setstonesizedata(stoneSize);
            setskeltonLoad(true);
            // WordPress: JewelCloud view-tracking pingback removed in 1.0.2 (see readme changelog).
        } catch (error) {
            console.log(error);
        }
    };

    const handleGallery = async (e) => {
        try {
            // Use current location pathname to get the latest URL after navigation
            const productUrl = location.pathname;
            const part = productUrl.substring(productUrl.lastIndexOf("-") + 1);
            
            // Only update if the product ID actually changed
            if (part && part !== getCurrentProductId && window.initData?.data?.[0]?.dealerid) {
                setCurrentProductId(part);
                // Reset skeleton loading state to show loading during fetch
                setskeltonLoad(false);
                await getProductDetails(window.initData.data[0].dealerid, part);
            }
        } catch (error) {
            console.error('Error in handleGallery:', error);
            setskeltonLoad(true); // Show content even on error
        }
    };

    const handleYourpassword = (event) => {
        setyourpassword(event.target.value);
    };

    const getDiamondsJCOptions = async (DealerID) => {
        try {
            const options = await diamondService.getDiamondsJCOptions(DealerID);
            setJCOptions(options);
        } catch (error) {
            console.error('Error fetching JC Options:', error);
            // Set to null on error so component can fallback to window.initData
            setJCOptions(null);
        }
    };

    const getDiamondNavigationData = async (DealerID) => {
        try {
            const navigationapi =
                window.initData?.data?.[0]?.navigationapi ||
                `${jcBase()}/GetNavigation?`;
            const res = await fetch(`${navigationapi}DealerId=${DealerID}`);
            const data = await res.json();
            if (data && data[0]) {
                setDiamondNavigation(data[0]);
            }
        } catch (error) {
            console.error("Error fetching diamond navigation:", error);
        }
    };

    const handleintstorageSubmit = async (e) => {
        e.preventDefault();
        setLoaded(true);
        let errors = {};
        let formIsValid = true;

        if (getyourpassword === "") {
            errors["yourpassword"] = "Please enter your password";
            formIsValid = false;
        }

        if (formIsValid === false) {
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

    useEffect(() => {
        window.scrollTo(0, 0);
        let isMounted = true;

        const initializeData = async () => {
            try {
                // Removed redirect condition to allow local development
                // if (window.initData.data[0].is_api === "false") {
                //     window.location.href = "/collections/ringbuilder-settings";
                // }
                if (isMounted &&
                    getsettingcookies._shopify_ringsetting &&
                    getsettingcookies._shopify_ringsetting[0] &&
                    getsettingcookies._shopify_ringsetting[0].setting_id
                ) {
                    setsettingcookie(true);
                }
                if (isMounted &&
                    getdiamondcookies._shopify_diamondsetting &&
                    getdiamondcookies._shopify_diamondsetting[0] &&
                    getdiamondcookies._shopify_diamondsetting[0].diamondId
                ) {
                    setDiamondCookie(true);
                }
                
                if (isMounted && window.initData?.data?.[0]?.dealerid) {
                    await getProductDetails(
                        window.initData.data[0].dealerid,
                        getCurrentProductId
                    );

                    // Fetch JC Options for social icons
                    getDiamondsJCOptions(window.initData.data[0].dealerid);
                    // Fetch diamond navigation for the Center Diamond Type dropdown
                    getDiamondNavigationData(window.initData.data[0].dealerid);
                }
            } catch (error) {
                console.error("Error in initializeData:", error);
            }
        };

        initializeData();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []);
    
    // Watch for URL changes and update product data (matching version 2 behavior)
    useEffect(() => {
        const productUrl = location.pathname;
        const part = productUrl.substring(productUrl.lastIndexOf("-") + 1);
        
        if (part && part !== getCurrentProductId && window.initData?.data?.[0]?.dealerid) {
            window.scrollTo(0, 0);
            setCurrentProductId(part);
            // Reset skeleton loading state to show loading during fetch
            setskeltonLoad(false);
            getProductDetails(window.initData.data[0].dealerid, part).catch((error) => {
                console.error('Error fetching product details:', error);
                setskeltonLoad(true); // Show content even on error
            });
        }
    }, [location.pathname, getCurrentProductId]);

    if (skeltonLoad == false) {
        // No ToastContainer here: the skeleton's container lingered next to the loaded one and
        // produced duplicate success toasts (WordPress fix, was scripts/patch-v1-toast.js).
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
                                <div className="div-right2">
                                    {" "}
                                    <Skeleton height={300} />{" "}
                                </div>{" "}
                            </div>{" "}
                        </div>{" "}
                        <div className="skeleton-div">
                            <div className="skelton-info">
                                {" "}
                                {/* <h4 className="div-left"><Skeleton /></h4> */}{" "}
                                <div className="div-right-price">
                                    <Skeleton height={40} />{" "}
                                    <Skeleton height={60} />{" "}
                                    <Skeleton height={30} width={200} />{" "}
                                    <Skeleton height={30} width={200} />{" "}
                                    <Skeleton height={30} width={200} />{" "}
                                    <Skeleton height={20} />{" "}
                                    <Skeleton height={40} />{" "}
                                    <div className="div-inner">
                                        <div className="div-skelton-inner">
                                            {" "}
                                            <Skeleton height={40} />{" "}
                                        </div>{" "}
                                        <div className="div-skelton-inner">
                                            {" "}
                                            <Skeleton height={40} />{" "}
                                        </div>{" "}
                                    </div>{" "}
                                    <Skeleton />
                                </div>{" "}
                            </div>{" "}
                        </div>{" "}
                    </div>{" "}
                    <Skeleton />
                </div>{" "}
            </>
        );
    } else {
        return (
            <>
                <ToastContainer
                    position="bottom-center"
                    autoClose={1000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <style>
                    {" "}
                    {`.product-info .top-icons span:hover i {
                color: ${window.initData["data"][0].hover_colour};
            }
            .product-info .product-controller ul li a:hover{
                  color:  ${window.initData["data"][0].hover_colour};
            }
            .product-info .product-controller ul li a:hover span i{
              background-color: ${window.initData["data"][0].hover_colour};
              color:  ${window.initData["data"][0].link_colour};
            }
            .product-info .diamond-tryon .btn-diamond{
              background-color:${window.initData["data"][0].button_colour} ;
            }
            .btn:hover{
               background-color: ${window.initData["data"][0].hover_colour};
            }
            
            `}{" "}
                </style>{" "}
                <div className="tool-container">
                    <Topheader> </Topheader>{" "}
                    {getsettingcookie === false &&
                        getDiamondCookie === true && (
                            <div className="breadCumbs">
                                {" "}
                                {DataDiamond.map((item) => (
                                    <Breadcumb Data={item} key={item.key} />
                                ))}{" "}
                            </div>
                        )}{" "}
                    {getsettingcookie === true &&
                        getDiamondCookie === false && (
                            <div className="breadCumbs">
                                {" "}
                                {Data.map((item) => (
                                    <Breadcumb Data={item} key={item.key} />
                                ))}{" "}
                            </div>
                        )}{" "}
                    {getsettingcookie === false &&
                        getDiamondCookie === false && (
                            <div className="breadCumbs">
                                {" "}
                                {Data.map((item) => (
                                    <Breadcumb Data={item} key={item.key} />
                                ))}{" "}
                            </div>
                        )}{" "}
                    {getsettingcookie === true && getDiamondCookie === true && (
                        <div className="breadCumbs">
                            {" "}
                            {Data.map((item) => (
                                <Breadcumb Data={item} key={item.key} />
                            ))}{" "}
                        </div>
                    )}{" "}
                    <div className="product-info">
                    <div className="product-info__box">
                        <div className="product-info__image">
                            <ProductGallary
                                productDetailsData={getProductData}
                                currenturl={selectedmetal}
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
                                                        <p>Setting Id</p>
                                                    </div>
                                                    <div className="diamonds-info">
                                                        <p>
                                                            {getProductData.settingId ||
                                                                getProductData.stockNumber ||
                                                                getProductData.diamondId ||
                                                                "-"}
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
                            <ProductInformation
                                productDetailsData={getProductData}
                                centerstoneData={getstonesizedata}
                                selectedCenterStone={getselectedStone}
                                selectedSideStone={getselectedSideStone}
                                currenturl={selectedmetal}
                                callback={handleGallery}
                                jcOptions={getJCOptions}
                                diamondNavigation={getDiamondNavigation}
                            />{" "}
                        </div>{" "}
                    </div>{" "}
                </div>{" "}
            </>
        );
    }
};

export default SettingDetails;
