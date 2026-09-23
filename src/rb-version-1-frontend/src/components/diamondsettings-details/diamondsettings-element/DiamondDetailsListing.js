import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";
import Pagination from "react-bootstrap/Pagination";
import Modal from "react-bootstrap/Modal";
import "react-responsive-modal/styles.css";
import MyPagination from "./Pagination";
import ListDataTable from "./ListDataTable";
import { useCookies } from "react-cookie";
import Checkbox from "rc-checkbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../../utils/priceUtils";
import {
    determineDiamondType,
    registerCompareDiamondType,
    removeCompareDiamondType,
} from "../../../utils/compareUtils";
import { RB_BASE, jcVideoUrl } from '../../../wp/wpEnv';
import diamondGif from '../../../images/diamond.gif';
import spinnerGif from '../../../images/spinner.gif';

function Preloader(props) {
    return (
        <img
            className="gf-rb-preloaderr"
            alt="spinner"
            src={
                spinnerGif
            }
            style={{ width: "21px", height: "24px", marginInline: "auto" }}
        />
    );
}

const DiamondSettingsProducts = (props) => {
    const getInitialCompareCount = () => {
        if (typeof window !== "undefined" && Array.isArray(window.compareproduct)) {
            return window.compareproduct.length;
        }
        return 0;
    };

    const [text, setText] = useState("");
    const navigate = useNavigate();

    const [modalShow, setModalShow] = React.useState(false);
    const [getVideo, setVideo] = useState("");
    const [videoLoading, setVideoLoading] = useState(true);
    const [getpaginationpagecount, setpaginationpagecount] = useState(
        window.initData?.data?.[0]?.products_pp || "12"
    );
    const [currPage, setCurrPage] = useState(1);
    const [getInfo, setInfo] = useState("");
    // Set initial view mode based on props.initialViewMode
    const initialViewMode = props.initialViewMode || 'grid';
    
    const [getgrid, setgrid] = useState(initialViewMode === 'grid');
    const [getlist, setlist] = useState(initialViewMode === 'list');
    const [getGridClass, setGridClass] = useState(initialViewMode === 'grid' ? "active" : "inactive");
    const [getlistClass, setlistClass] = useState(initialViewMode === 'list' ? "active" : "inactive");
    const [getAscClass, setAscClass] = useState("active");
    const [getDescClass, setDescClass] = useState("inactive");
    const [getOrderType, setOrderType] = useState("ASC");
    const [getSearch, setSearch] = useState("");
    const [getclose, setClose] = useState("false");
    const [cookies, setCookie] = useCookies(["_compareitems"]);
    const [compareProductCookie] = useCookies(["compareproductcookie"]);
    const [savedCompareCookie] = useCookies(["_wpsavedcompareproductcookie"]);
    const [getCompare, setCompare] = useState([]);
    const [isChecked, setIsChecked] = useState(false);
    const [getCompareCount, setCompareCount] = useState(() => getInitialCompareCount());

    const parseCookieArray = (cookieValue) => {
        if (!cookieValue) {
            return [];
        }

        if (Array.isArray(cookieValue)) {
            return cookieValue;
        }

        if (typeof cookieValue === "string") {
            const normalizedValue = cookieValue.startsWith("j:")
                ? cookieValue.substring(2)
                : cookieValue;

            try {
                const parsed = JSON.parse(normalizedValue);
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                console.warn(
                    "[DiamondDetailsListing] Failed to parse compare cookie",
                    {
                        cookieValue,
                        normalizedValue,
                        error,
                    }
                );
                return [];
            }
        }

        return [];
    };

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        if (!Array.isArray(window.compareproduct)) {
            window.compareproduct = [];
        }

        const compareCookieIds = parseCookieArray(
            compareProductCookie.compareproductcookie
        );
        const savedCookieIds = parseCookieArray(
            savedCompareCookie._wpsavedcompareproductcookie
        );

        if (
            window.compareproduct.length === 0 &&
            (savedCookieIds.length > 0 || compareCookieIds.length > 0)
        ) {
            window.compareproduct = savedCookieIds.length
                ? [...savedCookieIds]
                : [...compareCookieIds];
        }

        setCompareCount(window.compareproduct.length);
    }, [
        compareProductCookie.compareproductcookie,
        savedCompareCookie._wpsavedcompareproductcookie,
    ]);
    const [getvideoloader, setvideoloader] = useState("true");
    const [getShapeOrderType, setShapeOrderType] = useState("");
    const [getPriceOrderType, setPriceOrderType] = useState("");
    const [getCaratOrderType, setCaratOrderType] = useState("");
    const [getColorOrderType, setColorOrderType] = useState("");
    const [getClarityOrderType, setClarityOrderType] = useState("");
    const [getCutOrderType, setCutOrderType] = useState("");
    const [getDepthOrderType, setDepthOrderType] = useState("");
    const [getTableOrderType, setTableOrderType] = useState("");
    const [getPolishOrderType, setPolishOrderType] = useState("");
    const [getSymmetryOrderType, setSymmetryOrderType] = useState("");
    const [getMeasurementOrderType, setMeasurementOrderType] = useState("");
    const [getCertificateOrderType, setCertificateOrderType] = useState("");

    const spinner = () => {
        // setTimeout(() => {
        setvideoloader("false");
        // }, 500);
    };

    const onSubmit = (evt) => {
        evt.preventDefault();
        if (getSearch === "") {
            alert("Please enter your search value");
            return false;
        }
        props.searchvalue(getSearch);
        setClose("true");
    };

    const onChange = (evt) => {
        setSearch(evt.target.value);
    };

    const onClose = (evt) => {
        evt.preventDefault();
        setSearch("");
        props.searchvalue("");
        setClose("false");
    };

    const handlePageSizeChange = (event) => {
        props.changedpagesize(event.target.value);
        setpaginationpagecount(event.target.value);
    };

    // Sort state, toolbar icon and the API request must always agree (WordPress fix, was
    // scripts/patch-v1-sort-direction.js). The toolbar shows only the ".active" link.
    const applyOrder = (orderBy, newOrder) => {
        if (orderBy) {
            props.orderbytype(orderBy);
        }
        setOrderType(newOrder);
        setAscClass(newOrder === "ASC" ? "active" : "inactive");
        setDescClass(newOrder === "DESC" ? "active" : "inactive");
        props.orderType(newOrder);
    };

    // Switching the sort field always starts ascending, in both the request and the icon.
    const handleorderbytype = (event) => {
        applyOrder(event.target.value, "ASC");
    };

    const afterPageClicked = (page_number) => {
        setCurrPage(page_number);
        props.currentpageno(page_number);
        const scrollElement = document.getElementById("diamondDetailScrollUp");
        if (scrollElement) {
            scrollElement.scrollIntoView({
                behavior: "smooth",
            });
        }
    };

    const handleModel = async (diamondId, event) => {
        if (event) {
            event.preventDefault();
        }
        
        if (!diamondId) {
            console.error('Diamond ID not found');
            return;
        }
        
        setvideoloader("true");
        setModalShow(true);
        
        try {
            const videoApiUrl = (window.initData?.data?.[0]?.videoapi || jcVideoUrl()) + `InventoryID=${diamondId}&Type=Diamond`;
            const res = await fetch(videoApiUrl);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const geturl = await res.json();
            
            if (geturl && geturl.videoURL) {
                setVideo(geturl.videoURL);
            } else {
                console.error('No video URL in response:', geturl);
                setVideo("");
                setvideoloader("false");
            }
        } catch (error) {
            console.error('Error loading video:', error);
            setVideo("");
            setvideoloader("false");
            // Keep modal open to show error state
        }
    };

    // Only the active direction's link is visible, so toggle off the current state rather than
    // branching on which link was clicked (that could never reach the other direction).
    const handleOrderClass = (event) => {
        event.preventDefault();
        applyOrder(null, getOrderType === "ASC" ? "DESC" : "ASC");
    };

    const closehandleModel = async (event) => {
        setModalShow(false);
    };

    const onOpenInfo = (e) => {
        e.preventDefault();
        var currentId = e.target.id;
        var c = currentId.split("-");
        setInfo(c[1]);
        if (getInfo === c[1]) {
            setInfo("");
        }
    };

    const hideInfo = (e) => {
        setInfo("");
    };

    const onOpenGrid = (e) => {
        e.preventDefault();
        setgrid(true);
        setlist(false);
        setGridClass("active");
        setlistClass("inactive");
    };
    const onOpenList = (e) => {
        e.preventDefault();
        setlist(true);
        setgrid(false);
        setGridClass("inactive");
        setlistClass("active");
    };

    const handleCompare = (item, e) => {
        if (!Array.isArray(window.compareproduct)) {
            window.compareproduct = [];
        }

        const diamondId = item?.diamondId || e.target.value;

        if (!diamondId) {
            return;
        }

        if (e.target.checked === false) {
            const index = window.compareproduct.indexOf(diamondId);
            if (index !== -1) {
                window.compareproduct.splice(index, 1);
            }
            removeCompareDiamondType(diamondId);
        } else {
            if (window.compareproduct.length >= 6) {
                toast("You can not add more than 6 products.");
                e.target.checked = false;
                return;
            }

            if (window.compareproduct.indexOf(diamondId) === -1) {
                window.compareproduct.push(diamondId);
            }
            registerCompareDiamondType(diamondId, determineDiamondType(item));
        }
        setCompareCount(window.compareproduct.length);
        console.log("[DIAMOND LISTING] compare IDs queued for cookie:", window.compareproduct);
        console.log("[DIAMOND LISTING] compare diamond types queued for cookie:", window.compareProductDiamondType);
    };

    const handlefilterprice = (e, direction) => {
        applyOrder("FltPrice", direction || (getOrderType === "ASC" ? "DESC" : "ASC"));
    };

    const handleshape = (e, direction) => {
        applyOrder("Cut", direction || (getOrderType === "ASC" ? "DESC" : "ASC"));
    };

    const handlecarat = (e, direction) => {
        applyOrder("Size", direction || (getOrderType === "ASC" ? "DESC" : "ASC"));
    };

    const handleColor = (e, direction) => {
        applyOrder("Color", direction || (getOrderType === "DESC" ? "ASC" : "DESC"));
    };

    const handleIntensity = (e, direction) => {
        applyOrder("FancyColorIntensity", direction || (getOrderType === "DESC" ? "ASC" : "DESC"));
    };

    const handleclarity = (e, direction) => {
        applyOrder("ClarityID", direction || (getOrderType === "ASC" ? "DESC" : "ASC"));
    };

    const handlecutgrade = (e, direction) => {
        applyOrder("CutGrade", direction || (getOrderType === "ASC" ? "DESC" : "ASC"));
    };

    const handledepth = (e, direction) => {
        applyOrder("Depth", direction || (getOrderType === "ASC" ? "DESC" : "ASC"));
    };

    const handletablemeasure = (e, direction) => {
        applyOrder("TableMeasure", direction || (getOrderType === "ASC" ? "DESC" : "ASC"));
    };

    const handlepolish = (e, direction) => {
        applyOrder("Polish", direction || (getOrderType === "ASC" ? "DESC" : "ASC"));
    };

    const handlesymmetry = (e, direction) => {
        applyOrder("Symmetry", direction || (getOrderType === "ASC" ? "DESC" : "ASC"));
    };

    const handlemeasurements = (e, direction) => {
        applyOrder("Measurements", direction || (getOrderType === "ASC" ? "DESC" : "ASC"));
    };

    const handlecertificate = (e, direction) => {
        applyOrder("Certificate", direction || (getOrderType === "ASC" ? "DESC" : "ASC"));
    };

    const handleCheckbox = (e) => {
        setCompareCount(e);
    };

    const handleBottomCompare = (e) => {
        e.preventDefault();
        // Check if at least 2 diamonds are selected
        if (window.compareproduct.length < 2) {
            toast("Please select minimum 2 diamonds to compare.", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }
        
        // Trigger the compare tab click
        const compareTab = document.getElementById("compare");
        if (compareTab) {
            compareTab.click();
        }
    };

    const handleSetBackValue = (item, e) => {
        e.preventDefault();

        if (item.isLabCreated === true || item.isLabCreated === "true") {
            navigate(
                `${RB_BASE}/diamondtools/product/` +
                    item.shape.replace(/\s+/g, "-").toLowerCase() +
                    "-shape-" +
                    item.carat.replace(/\s+/g, "-").toLowerCase() +
                    "-carat-" +
                    item.color.replace(/\s+/g, "-").toLowerCase() +
                    "-color-" +
                    item.clarity.replace(/\s+/g, "-").toLowerCase() +
                    "-clarity-" +
                    item.cut.replace(/\s+/g, "-").toLowerCase() +
                    "-cut-" +
                    item.cert.replace(/\s+/g, "-").toLowerCase() +
                    "-certificate-" +
                    "-sku-" +
                    item.diamondId +
                    "/labcreated"
            );
            window.location.reload();
        } else if (item.fancyColorIntensity) {
            navigate(
                `${RB_BASE}/diamondtools/product/` +
                    item.shape.replace(/\s+/g, "-").toLowerCase() +
                    "-shape-" +
                    item.carat.replace(/\s+/g, "-").toLowerCase() +
                    "-carat-" +
                    item.color.replace(/\s+/g, "-").toLowerCase() +
                    "-color-" +
                    item.clarity.replace(/\s+/g, "-").toLowerCase() +
                    "-clarity-" +
                    item.cut.replace(/\s+/g, "-").toLowerCase() +
                    "-cut-" +
                    item.cert.replace(/\s+/g, "-").toLowerCase() +
                    "-certificate-" +
                    "-sku-" +
                    item.diamondId +
                    "/fancydiamonds"
            );
            window.location.reload();
        } else {
            navigate(
                `${RB_BASE}/diamondtools/product/` +
                    item.shape.replace(/\s+/g, "-").toLowerCase() +
                    "-shape-" +
                    item.carat.replace(/\s+/g, "-").toLowerCase() +
                    "-carat-" +
                    item.color.replace(/\s+/g, "-").toLowerCase() +
                    "-color-" +
                    item.clarity.replace(/\s+/g, "-").toLowerCase() +
                    "-clarity-" +
                    item.cut.replace(/\s+/g, "-").toLowerCase() +
                    "-cut-" +
                    item.cert.replace(/\s+/g, "-").toLowerCase() +
                    "-certificate-" +
                    "-sku-" +
                    item.diamondId
            );
            window.location.reload();
        }
    };

    useEffect(() => {
        if ((window.initData.data[0].default_view ?? window.initData.data[0].default_viewmode) === "grid") {
            setgrid(true);
            setlist(false);
            setGridClass("active");
            setlistClass("inactive");
        } else if ((window.initData.data[0].default_view ?? window.initData.data[0].default_viewmode) === "list") {
            setgrid(false);
            setlist(true);
            setGridClass("inactive");
            setlistClass("active");
        }
    }, []);

    // Sync pagination component with restored page number from back navigation
    useEffect(() => {
        // Only restore page number if we're on the diamond listing page (not diamond details page)
        // The diamond details page should not restore page numbers from the listing page
        if (props.currentpagenovalue && props.currentpagenovalue !== "1" && !props.isDetailsPage) {
            setCurrPage(parseInt(props.currentpagenovalue));
        }
    }, [props.currentpagenovalue, props.isDetailsPage]);

    return (
        <>
            <Modal
                show={modalShow}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header
                    closeButton
                    onClick={closehandleModel}
                ></Modal.Header>
                <Modal.Body className="gf-rb-video-modal-body" style={{ minHeight: "500px" }}>
                    {getvideoloader === "true" ? (
                        <div className="modal__spinner gf-rb-video-modal-spinner">
                            <img
                                className="gf-rb-preloaderr"
                                alt="preLoad"
                                src={
                                    diamondGif
                                }
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    marginInline: "auto",
                                }}
                            />
                        </div>
                    ) : null}
                    <iframe
                        className="modal__video-style"
                        onLoad={spinner}
                        width="100%"
                        height="500"
                        title="Video"
                        src={getVideo}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </Modal.Body>
            </Modal>
            {/* <ToastContainer
        position="bottom-left"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}

            <div className="diamond-searching-result">
                <div className="result-number">
                    {Number(props.productCount) === 0 ? (
                        <p>No Records Found</p>
                    ) : (
                        <p>
                            {props.productCount} <strong>Similar Diamonds</strong>
                        </p>
                    )}
                    <span className="pattern-line">|</span>
                    <p id="compare-items">
                        <strong>
                            {" "}
                            Compare Items (
                            <span id="total-price">{getCompareCount}</span>)
                        </strong>
                    </p>
                </div>
                <div className="diamond-search-details">
                    <div className="change-view-result">
                        <p>Per Page</p>
                        <select
                            className="result-perpage"
                            value={getpaginationpagecount}
                            id="per-page"
                            name="perpage"
                            onChange={handlePageSizeChange}
                        >
                            <option value="12">12</option>
                            <option value="24">24</option>
                            <option value="48">48</option>
                            <option value="99">99</option>
                        </select>
                    </div>
                    <div className="grid-view-sort">
                        <select
                            name="dropdown-orderby"
                            defaultValue={"Cut"}
                            id="dropdown-sort"
                            className="dropdown-sort pooja"
                            onChange={handleorderbytype}
                        >
                            <option value="Cut">Shape</option>
                            <option value="Size">Carat</option>
                            <option value="Color">Color</option>
                            {props.tabvalue !== "" && (
                                <option value="FancyColorIntensity">
                                    Intensity
                                </option>
                            )}
                            <option value="ClarityID">Clarity</option>
                            <option value="CutGrade">Cut</option>
                            {/* <option value="Depth">Depth</option> */}
                            {/* <option value="TableMeasure">Table</option> */}
                            {/* <option value="Polish">Polish</option> */}
                            {/* <option value="Symmetry">Symmetry</option> */}
                            {/* <option value="Measurements">Measurement</option> */}
                            <option value="Certificate">Certificate</option>
                            <option value="FltPrice">Price</option>
                        </select>
                    </div>
                    <div className="grid-view-orderby">
                        <a
                            href="javascript:;"
                            id="asc"
                            onClick={handleOrderClass}
                            className={`${getAscClass}`}
                        >
                            ASC
                        </a>
                        <a
                            href="javascript:;"
                            id="desc"
                            onClick={handleOrderClass}
                            className={` ${getDescClass}`}
                        >
                            DESC
                        </a>
                    </div>
                </div>
                <div className="diamond-search-lists">
                    <div className="diamond-change-view">
                        <ul>
                            <li
                                className={`grid-view ${
                                    getgrid === true ? "active" : ""
                                } `}
                            >
                                <a
                                    href=""
                                    data-tip="Grid View"
                                    id="grid-view-four"
                                    data-grid="grid-col-four"
                                    onClick={onOpenGrid}
                                    className="grid-view-four"
                                >
                                    Grid view 3 column
                                </a>
                                <ReactTooltip />
                            </li>
                            <li
                                className={`list-view ${
                                    getlist === true ? "active" : ""
                                } `}
                            >
                                <a
                                    href=""
                                    data-tip="list view"
                                    id="grid-list-view"
                                    data-grid="grid-col-list"
                                    onClick={onOpenList}
                                    className="listview"
                                >
                                    List View
                                </a>
                                <ReactTooltip />
                            </li>
                        </ul>
                    </div>

                    <div className="search-bar">
                        <form onSubmit={onSubmit}>
                            <input
                                type="text"
                                name="searchdidfield"
                                id="searchdidfield"
                                placeholder="Search Diamond ID"
                                value={getSearch}
                                onChange={onChange}
                                className="search-field"
                            />
                            <button type="button" className={`close_button ${getclose === "true" ? "active" : ""}`} onClick={onClose}>x</button>
                            <button type="submit" className={`search-btn active`}></button>
                        </form>
                    </div>
                </div>
            </div>
            {/* product listing starting */}

            <div className={`search-product-listing ${getGridClass}`} style={{display: getgrid ? 'block' : 'none'}}>
                <ul className="product-grid-view grid-col-four" id="grid-mode">
                    {props.getDataSettingProductData.map((item) => (
                        <li className="product-listing" key={item.$id}>
                            <a
                                href="javascript:;"
                                className="slidebutton"
                                onClick={onOpenInfo}
                            >
                                <i
                                    className="fas fa-ellipsis-h"
                                    id={`popup-${item.diamondId}`}
                                ></i>
                            </a>
                            <div
                                className={`product-inner-info ${getInfo} ${
                                    getInfo === item.diamondId ? "active" : ""
                                }`}
                                onClick={hideInfo}
                            >
                                <ul>
                                    <li>
                                        <p>
                                            <span>Diamond ID </span>
                                            <span>{item.diamondId}</span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Shape</span>
                                            <span>{item.shape}</span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Carat</span>
                                            <span>
                                                {item.carat ? item.carat : "-"}
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Color</span>
                                            <span>
                                                {item.color ? item.color : "-"}
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Clarity</span>
                                            <span>
                                                {item.clarity
                                                    ? item.clarity
                                                    : "-"}
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Cut</span>
                                            <span>
                                                {item.cut ? item.cut : "-"}
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Depth</span>
                                            <span>
                                                {item.depth ? item.depth : "-"}
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Table</span>
                                            <span>
                                                {item.table ? item.table : "-"}
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Polish</span>
                                            <span>
                                                {item.polish
                                                    ? item.polish
                                                    : "-"}
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Symmetry</span>
                                            <span>
                                                {item.symmetry
                                                    ? item.symmetry
                                                    : "-"}
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Measurement</span>
                                            <span>
                                                {item.measurement
                                                    ? item.measurement
                                                    : "-"}
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Certificate</span>
                                            <span>
                                                <a href={item.certificateUrl}>
                                                    {item.cert
                                                        ? item.cert
                                                        : "-"}
                                                </a>
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Price</span>
                                            <span>
                                                {formatPrice(item)}
                                            </span>
                                        </p>
                                    </li>
                                </ul>
                            </div>
                            <a
                                href="javascript:;"
                                className={`video-popup ${
                                    item.videoFileName !== ""
                                        ? "video-active"
                                        : ""
                                }`}
                                onClick={(e) => handleModel(item.diamondId, e)}
                            >
                                <i
                                    id={item.diamondId}
                                    className="fas fa-video"
                                ></i>
                            </a>
                            <a
                                href="javascript:;"
                                onClick={(e) => props.handleSetBackValue ? props.handleSetBackValue(item, e) : handleSetBackValue(item, e)}
                                data-tip="View Diamond Details"
                                title="View Diamond Details"
                            >
                                <div className="product-images">
                                    <img
                                        src={item.biggerDiamondimage}
                                        alt={item.detailLinkText}
                                    ></img>
                                </div>
                                <div className="gf-product-details">
                                    <div className="product-item-name">
                                        <span>
                                            {" "}
                                            {item.shape}{" "}
                                            <strong> {item.carat} </strong>{" "}
                                            CARAT
                                        </span>
                                        <span>
                                            {" "}
                                            {item.color} , {item.clarity}{" "}
                                        </span>
                                    </div>
                                    {/* <h2 className="product-name"> <strong> {item.name}</strong></h2> */}
                                </div>
                            </a>
                            <h5 className="product-price">
                                {formatPrice(item)}
                            </h5>
                            {window.compareproduct.indexOf(item.diamondId) > -1 ? (
                                <div className="product-box-action">
                                    <label>
                                        <Checkbox
                                            value={item.diamondId}
                                            onClick={(event) =>
                                                handleCompare(item, event)
                                            }
                                            checked={true}
                                        />
                                        Add to Compare
                                    </label>
                                </div>
                            ) : (
                                <div className="product-box-action">
                                    <label>
                                        <Checkbox
                                            value={item.diamondId}
                                            onClick={(event) =>
                                                handleCompare(item, event)
                                            }
                                        />
                                        Add to Compare
                                    </label>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            {Number(props.productCount) > 0 && (
            <div className={`product-datatable ${getlistClass}`} style={{display: getlist ? 'block' : 'none'}}>
                <ListDataTable
                    listviewData={props.getDataSettingProductData}
                    checkboxcount={handleCheckbox}
                    filterPrice={handlefilterprice}
                    filtershape={handleshape}
                    filterCarat={handlecarat}
                    filterColor={handleColor}
                    filterIntensity={handleIntensity}
                    filterClarity={handleclarity}
                    filterCut={handlecutgrade}
                    filterCertificate={handlecertificate}
                    filterMeasurement={handlemeasurements}
                    filterPolish={handlepolish}
                    filterTable={handletablemeasure}
                    filterDepth={handledepth}
                    filterSummery={handlesymmetry}
                    tabname={props.tabvalue}
                />
            </div>
            )}
            {Number(props.productCount) > 0 && (
            <div className="result-pagination">
                <div className="btn-compare">
          <a href="#" id="compare-main" className="btn" onClick={handleBottomCompare}>
            {" "}
            Compare(<span id="totaldiamond">{getCompareCount}</span>)
          </a>
        </div>
                <div className="result-bottom">
                    <h2>
                        Results {props.startPage} to {props.endPage} of{" "}
                        {props.productCount}{" "}
                    </h2>
                </div>
                <div className="diamond-product-pagination">
                    <MyPagination
                        totPages={props.totalPages}
                        currentPage={props.currentpagenovalue ? parseInt(props.currentpagenovalue) : currPage}
                        pageClicked={(ele) => {
                            afterPageClicked(ele);
                        }}
                    ></MyPagination>
                </div>
            </div>
            )}
        </>
    );
};

export default DiamondSettingsProducts;
