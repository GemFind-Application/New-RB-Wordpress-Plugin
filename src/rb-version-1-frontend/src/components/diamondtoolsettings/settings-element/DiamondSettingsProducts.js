import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import ReactTooltip from "react-tooltip";
import Pagination from "react-bootstrap/Pagination";
import Modal from "react-bootstrap/Modal";
import "react-responsive-modal/styles.css";
import spinn from "../../../images/spinner.gif";
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
import VideoFrame from "../../elements/VideoFrame";

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
                "[DiamondSettingsProducts] Failed to parse compare cookie",
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

const DiamondSettingsProducts = (props) => {
    const getInitialCompareCount = () => {
        if (typeof window !== "undefined" && Array.isArray(window.compareproduct)) {
            return window.compareproduct.length;
        }
        return 0;
    };

    const [text, setText] = useState("");
    const [modalShow, setModalShow] = React.useState(false);
    const [getVideo, setVideo] = useState("");
    const [videoLoading, setVideoLoading] = useState(true);
    const [getpaginationpagecount, setpaginationpagecount] = useState("12");
    const [currPage, setCurrPage] = useState(1);
    const [getInfo, setInfo] = useState("");
    const [getgrid, setgrid] = useState(true);
    const [getlist, setlist] = useState(false);
    const [getGridClass, setGridClass] = useState("grid-view-four");
    const [getlistClass, setlistClass] = useState("grid-list-view");
    const [getAscClass, setAscClass] = useState("active");
    const [getDescClass, setDescClass] = useState("inactive");
    const [getOrderType, setOrderType] = useState("ASC");
    const [getSearch, setSearch] = useState("");
    const [getclose, setClose] = useState("false");
    const [cookies, setCookie] = useCookies(["_compareitems"]);
    const [getCompare, setCompare] = useState([]);
    const [isChecked, setIsChecked] = useState(false);
    const [getCompareCount, setCompareCount] = useState(() => getInitialCompareCount());
    const [getcomparecookies, setcomparecookies] = useCookies([
        "_wpsavedcompareproductcookie",
    ]);
    const [getbrowserdiamondcookies, setbrowserdiamondcookies] = useCookies([
        "shopify_diamondbackvalue",
    ]);
    const [getcpcookies, setcpcookies, removeCookie] = useCookies([
        "cookie-name",
    ]);

    const [getvideoloader, setvideoloader] = useState("true");
    const [getprouductClass, setprouductClass] = useState();
    const [getproductselected, productselected] = useState();

    const spinner = () => {
        setvideoloader("false");
    };
    const navigate = useNavigate();

    useEffect(() => {
        if (typeof window !== "undefined" && !Array.isArray(window.compareproduct)) {
            window.compareproduct = [];
        }

        const compareCookieIds = parseCookieArray(getcpcookies.compareproductcookie);
        const savedCookieIds = parseCookieArray(
            getcomparecookies._wpsavedcompareproductcookie
        );

        if (
            typeof window !== "undefined" &&
            window.compareproduct.length === 0 &&
            (savedCookieIds.length > 0 || compareCookieIds.length > 0)
        ) {
            window.compareproduct = savedCookieIds.length
                ? [...savedCookieIds]
                : [...compareCookieIds];
        }

        if (
            getbrowserdiamondcookies.shopify_diamondbackvalue &&
            getbrowserdiamondcookies.shopify_diamondbackvalue[0].diamondId
        ) {
            productselected(
                getbrowserdiamondcookies.shopify_diamondbackvalue[0].diamondId
            );
        }

        setCompareCount(
            typeof window !== "undefined" && Array.isArray(window.compareproduct)
                ? window.compareproduct.length
                : 0
        );
        setprouductClass(getproductselected);
    }, [
        getcomparecookies._wpsavedcompareproductcookie,
        getcpcookies.compareproductcookie,
        getbrowserdiamondcookies.shopify_diamondbackvalue,
        getproductselected,
    ]);
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
        props.pagesize(event.target.value);
        setpaginationpagecount(event.target.value);
    };

    const handleorderbytype = (event) => {
        props.orderbytype(event.target.value);
    };

    const afterPageClicked = (page_number) => {
        setCurrPage(page_number);
        props.currentpageno(page_number);
        document.getElementById("ringbuilderScrollUp").scrollIntoView({
            behavior: "smooth",
        });
    };

    const handleModel = async (event) => {
        setvideoloader("true");
        try {
            const res = await fetch(
                `${window.initData?.data?.[0]?.videoapi || jcVideoUrl()}InventoryID=${event.target.id}&Type=Diamond`
            );
            const geturl = await res.json();
            setVideo(geturl.videoURL);
            setModalShow(true);
        } catch (error) {
            console.log(error);
        }
    };

    const closehandleModel = async (event) => {
        setModalShow(false);
    };

    const handleOrderClass = (event) => {
        event.preventDefault();
        const newOrderType = event.target.id === "asc" ? "ASC" : "DESC";
        if (event.target.id === "asc") {
            setAscClass("inactive");
            setDescClass("active");
            setOrderType("ASC");
        } else {
            setAscClass("active");
            setDescClass("inactive");
            setOrderType("DESC");
        }
        props.orderType(newOrderType);
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

    const handleCompare = (checked, item) => {
        console.log('[GRID] handleCompare called', { checked, item });
        
        if (!Array.isArray(window.compareproduct)) {
            window.compareproduct = [];
        }

        const diamondId = item?.diamondId;
        const diamondType = determineDiamondType(item);

        console.log('[GRID] Diamond info', { diamondId, diamondType, item, checked });

        if (!diamondId) {
            console.warn('[GRID] No diamondId found');
            return;
        }

        if (checked === false) {
            console.log('[GRID] Unchecking diamond', diamondId);
            const index = window.compareproduct.indexOf(diamondId);
            if (index !== -1) {
                window.compareproduct.splice(index, 1);
            }
            removeCompareDiamondType(diamondId);
        } else {
            console.log('[GRID] Checking diamond', diamondId);
            if (window.compareproduct.length >= 6) {
                toast("You can not add more than 6 products.");
                return;
            }

            if (window.compareproduct.indexOf(diamondId) === -1) {
                window.compareproduct.push(diamondId);
            }
            console.log('[GRID] About to register diamond type', { diamondId, diamondType });
            registerCompareDiamondType(diamondId, diamondType);
        }

        setCompareCount(window.compareproduct.length);
    };

    const handlefilterprice = (e) => {
        props.orderbytype("FltPrice");
        const newOrder = getOrderType === "ASC" ? "DESC" : "ASC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handleshape = (e) => {
        props.orderbytype("Cut");
        const newOrder = getOrderType === "ASC" ? "DESC" : "ASC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handlesize = (e) => {
        props.orderbytype("Size");
        const newOrder = getOrderType === "ASC" ? "DESC" : "ASC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handlecolor = (e) => {
        props.orderbytype("Color");
        const newOrder = getOrderType === "DESC" ? "ASC" : "DESC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handleIntensity = (e) => {
        props.orderbytype("FancyColorIntensity");
        const newOrder = getOrderType === "DESC" ? "ASC" : "DESC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handleclarity = (e) => {
        props.orderbytype("ClarityID");
        const newOrder = getOrderType === "ASC" ? "DESC" : "ASC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handlecutgrade = (e) => {
        props.orderbytype("CutGrade");
        const newOrder = getOrderType === "ASC" ? "DESC" : "ASC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handledepth = (e) => {
        props.orderbytype("Depth");
        const newOrder = getOrderType === "ASC" ? "DESC" : "ASC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handletablemeasure = (e) => {
        props.orderbytype("TableMeasure");
        const newOrder = getOrderType === "ASC" ? "DESC" : "ASC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handlepolish = (e) => {
        props.orderbytype("Polish");
        const newOrder = getOrderType === "ASC" ? "DESC" : "ASC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handlesymmetry = (e) => {
        props.orderbytype("Symmetry");
        const newOrder = getOrderType === "ASC" ? "DESC" : "ASC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handlemeasurements = (e) => {
        props.orderbytype("Measurements");
        const newOrder = getOrderType === "ASC" ? "DESC" : "ASC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handlecertificate = (e) => {
        props.orderbytype("Certificate");
        const newOrder = getOrderType === "ASC" ? "DESC" : "ASC";
        setOrderType(newOrder);
        props.orderType(newOrder);
    };

    const handleCheckbox = (e) => {
        setCompareCount(e);
    };

    const handleSetBackValue = (item, e) => {
        try {
            e.preventDefault();

        var finalSetBackValue = [];
        finalSetBackValue.push({
            shapeName: props.shapeName,
            selectedCut: props.selectedCut,
            selectedColor: props.selectedColor,
            selectedClarity: props.selectedClarity,
            caratmin: props.caratmin,
            caratmax: props.caratmax,
            pricemin: props.pricemin,
            pricemax: props.pricemax,
            selectedFlour: props.selectedFlour,
            selectedPolish: props.selectedPolish,
            selectedfancyColor: props.selectedfancyColor,
            selectedfancyIntensity: props.selectedfancyIntensity,
            selectedmaxDept: props.selectedmaxDept,
            selectedminDept: props.selectedminDept,
            selectedmaxtable: props.selectedmaxtable,
            selectedmintable: props.selectedmintable,
            selectedSymmetry: props.selectedSymmetry,
            diamondId: item.diamondId,
            pageno: props.currentpagenovalue,
            tab: props.tabvalue,
        });

        setbrowserdiamondcookies(
            "shopify_diamondbackvalue",
            finalSetBackValue,
            {
                path: "/",
                maxAge: 604800,
            }
        );

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
        }
        } catch (error) {
            console.error("Error in handleSetBackValue:", error);
        }
    };

    const handleBottomCompare = (e) => {
        document.getElementById("compare").click();
    };

    return (
        <>
            <Modal
                className="gf-video-modal"
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
                    <VideoFrame
                        src={getVideo}
                        onLoad={spinner}
                    />
                </Modal.Body>
            </Modal>

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
                            defaultValue={"20"}
                            id="per-page"
                            name="perpage"
                            onChange={handlePageSizeChange}
                        >
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="grid-view-sort">
                        <select
                            name="dropdown-orderby"
                            defaultValue={"Shape"}
                            id="dropdown-sort"
                            className="dropdown-sort"
                            onChange={handleorderbytype}
                        >
                            <option value="Cut">Shape</option>
                            <option value="Size">Carat</option>
                            <option value="Color">Color</option>
                            {props.tabvalue === "fancycolor" && (
                                <option value="FancyColorIntensity">
                                    Intensity
                                </option>
                            )}
                            <option value="ClarityID">Clarity</option>
                            <option value="CutGrade">Cut</option>
                            {/* <option value="Depth">Depth</option>
                            <option value="TableMeasure">Table</option>
                            <option value="Polish">Polish</option>
                            <option value="Symmetry">Symmetry</option>
                            <option value="Measurements">Measurement</option> */}
                            <option value="Certificate">Certificate</option>
                            <option value="FltPrice">Price</option>
                        </select>
                    </div>
                    <div className="grid-view-orderby">
                        <a
                            href="#"
                            id="asc"
                            onClick={(e) => {
                                e.preventDefault();
                                handleOrderClass(e);
                            }}
                            className={`${getAscClass}`}
                        >
                            ASC
                        </a>
                        <a
                            href="#"
                            id="desc"
                            onClick={(e) => {
                                e.preventDefault();
                                handleOrderClass(e);
                            }}
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
                                placeholder="Search Diamond Stock#"
                                value={getSearch}
                                onChange={onChange}
                                className="search-field"
                            />
                            <button
                                type="button"
                                className={`close_button ${
                                    getclose === "true" ? "active" : ""
                                }`}
                                onClick={onClose}
                            >
                                x
                            </button>
                            <button
                                type="submit"
                                className={`search-btn active`}
                            ></button>
                        </form>
                    </div>
                </div>
            </div>
            {/* product listing starting */}

            <div className={`search-product-listing ${getGridClass}`}>
                <ul className="product-grid-view grid-col-four" id="grid-mode">
                    {(props.getDataSettingProductData || []).map((item, index) => (
                        <li
                            key={item.diamondId || item.$id || `diamond-${index}`}
                            className={`product-listing ${
                                getprouductClass === item.diamondId
                                    ? "active"
                                    : ""
                            }`}
                            id={item.diamondId}
                        >
                            <div className="product__detailss">
                                <a
                                    href="#"
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
                                        getInfo === item.diamondId
                                            ? "active"
                                            : ""
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
                                                    {item.carat
                                                        ? item.carat
                                                        : "-"}
                                                </span>
                                            </p>
                                        </li>
                                        <li>
                                            <p>
                                                <span>Color</span>
                                                <span>
                                                    {item.color
                                                        ? item.color
                                                        : "-"}
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
                                                    {item.depth
                                                        ? item.depth
                                                        : "-"}
                                                </span>
                                            </p>
                                        </li>
                                        <li>
                                            <p>
                                                <span>Table</span>
                                                <span>
                                                    {item.table
                                                        ? item.table
                                                        : "-"}
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
                                                    <a
                                                        href={
                                                            item.certificateUrl
                                                        }
                                                    >
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
                                    href="#"
                                    className={`video-popup ${
                                        item.videoFileName !== ""
                                            ? "video-active"
                                            : ""
                                    }`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleModel(e);
                                    }}
                                >
                                    <i
                                        id={item.diamondId}
                                        className="fas fa-video"
                                    ></i>
                                </a>
                            </div>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSetBackValue(item, e);
                                }}
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
                            {window.compareproduct.indexOf(item.diamondId) >
                                -1 ==
                                true && (
                                <div className="product-box-action checked">
                                    <label>
                                        <Checkbox
                                            value={item.diamondId}
                                            id={item.diamondId}
                                            onChange={(checked) =>
                                                handleCompare(checked, item)
                                            }
                                            checked={true}
                                        />
                                        Add to Compare
                                    </label>
                                </div>
                            )}
                            {window.compareproduct.indexOf(item.diamondId) >
                                -1 ==
                                false && (
                                <div className="product-box-action unchecked">
                                    <label>
                                        <Checkbox
                                            value={item.diamondId}
                                            id={item.diamondId}
                                            onChange={(checked) =>
                                                handleCompare(checked, item)
                                            }
                                        />
                                        {/* <input type="checkbox" name="comparebox[]" value={item.diamondId} onClick={handleCompare} id={item.diamondId} /> */}
                                        Add to Compare
                                    </label>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            {Number(props.productCount) > 0 && (
            <div className={`product-datatable ${getlistClass}`}>
                <ListDataTable
                    listviewData={props.getDataSettingProductData || []}
                    checkboxcount={handleCheckbox}
                    filterPrice={handlefilterprice}
                    filtershape={handleshape}
                    filterCarat={handlesize}
                    filterColor={handlecolor}
                    filterIntensity={handleIntensity}
                    filterClarity={handleclarity}
                    filterDepth={handledepth}
                    tabname={props.tabvalue}
                    filterTable={handletablemeasure}
                    filterPolish={handlepolish}
                    filterMeasurement={handlemeasurements}
                    filterCertificate={handlecertificate}
                    filterCut={handlecutgrade}
                    filterSummery={handlesymmetry}
                    selectValue={props}
                />
            </div>
            )}
            {Number(props.productCount) > 0 && (
                <div className="result-pagination">
                <div className="btn-compare">
                    <a
                        href="#"
                        id="compare-main"
                        className="btn"
                        onClick={handleBottomCompare}
                    >
                        {" "}
                        Compare(<span id="totaldiamond">{getCompareCount}</span>
                        )
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
                        currentPage={currPage}
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
