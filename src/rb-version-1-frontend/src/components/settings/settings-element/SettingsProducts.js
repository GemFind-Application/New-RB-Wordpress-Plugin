import React, { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
// import PageItem from 'react-bootstrap/PageItem';
import Modal from "react-bootstrap/Modal";
// import ModalBody from 'react-bootstrap/ModalBody';
import "react-responsive-modal/styles.css";
import MyPagination from "./Pagination";
import ImageLoader from "react-load-image";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox.css";
import { LoadingOverlay, Loader } from "react-overlay-loader";
import { formatPrice } from "../../../utils/priceUtils";
import { RB_BASE, jcVideoUrl, wpFetch } from '../../../wp/wpEnv';
import loader2Gif from '../../../images/loader-2.gif';
import ringGif from '../../../images/ring.gif';
import VideoFrame from "../../elements/VideoFrame";

function Preloader(props) {
    return (
        <img
            className="preloaderr"
            alt="spinner"
            src={
                loader2Gif
            }
            style={{ width: "21px", height: "24px" }}
        />
    );
}

const SettingsProduct = (props) => {
    
    const [modalShow, setModalShow] = React.useState(false);
    const [getGridClass, setGridClass] = useState("grid-col-four");
    const [getlithreeClass, setlithreeClass] = useState("inactive");
    const [getprouductClass, setprouductClass] = useState();
    const [getlifourClass, setlifourClass] = useState("active");
    const [getpaginationpagecount, setpaginationpagecount] = useState(
        window.initData?.data?.[0]?.products_pp || "12"
    );
    const [currPage, setCurrPage] = useState(1);
    const [getSearch, setSearch] = useState("");
    const [getclose, setClose] = useState("false");
    const [getVideo, setVideo] = useState("");
    const [getvideoloader, setvideoloader] = useState("true");
    const [getbrowsercookies, setbrowsercookies] = useCookies([
        "shopify_ringbackvalue",
    ]);
    const [getproductselected, productselected] = useState();
    const [getTryon, setTryon] = useState("false");
    const [getTryonsrc, setTryonsrc] = useState("");
    const [getTryonmodalShow, setTryonmodalShow] = React.useState(false);
    const [loaded, setLoaded] = useState(false);

    const navigate = useNavigate();
    const spinner = () => {
        setvideoloader("false");
    };

    const afterPageClicked = (page_number) => {
        setCurrPage(page_number);
        props.currentpageno(page_number);
        document.getElementById("ringbuilderSettingScrollUp").scrollIntoView({
            behavior: "smooth",
        });
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
        props.pagesize(event.target.value);
        setpaginationpagecount(event.target.value);
    };

    const handlePageAscDesc = (event) => {
        props.priceascdesc(event.target.value);
    };

    const gridClassChange = (event) => {
        event.preventDefault();
        if (event.target.id === "grid-col-four") {
            setlifourClass("active");
            setlithreeClass("inactive");
        } else {
            setlifourClass("inactive");
            setlithreeClass("active");
        }
        setGridClass(event.target.id);
    };

    useEffect(() => {
        if (getbrowsercookies.shopify_ringbackvalue) {
            if (
                getbrowsercookies.shopify_ringbackvalue &&
                getbrowsercookies.shopify_ringbackvalue[0].settingId
            ) {
                productselected(
                    getbrowsercookies.shopify_ringbackvalue[0].settingId
                );
            }
            // Sync pagination component with restored page number
            if (
                getbrowsercookies.shopify_ringbackvalue &&
                getbrowsercookies.shopify_ringbackvalue[0].pageno
            ) {
                console.log("Restoring page number:", getbrowsercookies.shopify_ringbackvalue[0].pageno);
                setCurrPage(parseInt(getbrowsercookies.shopify_ringbackvalue[0].pageno));
            }
        }
        setprouductClass(getproductselected);
        window.addEventListener("message", function (event) {
            if (event.data === "closeIframe") {
                setLoaded(false);
                setTryon("false");
                setTryonmodalShow(false);
            }
        });
    }, [getproductselected, getbrowsercookies]);

    const handleModel = async (settingId, event) => {
        if (event) {
            event.preventDefault();
        }
        
        if (!settingId) {
            console.error('Setting ID not found');
            return;
        }
        
        // Reset video URL and show loader immediately
        setVideo("");
        setvideoloader("true");
        setModalShow(true);
        
        try {
            const videoApiUrl = (window.initData?.data?.[0]?.videoapi || jcVideoUrl()) + `InventoryID=${settingId}&Type=Jewelry`;
            const res = await wpFetch(videoApiUrl);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const geturl = await res.json();
            
            if (geturl && geturl.videoURL) {
                setVideo(geturl.videoURL);
                // Loader will be hidden when iframe onLoad event fires
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

    const closehandleModel = async (event) => {
        setModalShow(false);
    };

    const handlevirtualtryon = (item, e) => {
        e.preventDefault();
        setLoaded(true);
        setTryon("true");
        setTryonmodalShow(true);
        setTryonsrc(
            `https://cdn.camweara.com/gemfind/index_client.php?company_name=Gemfind&ringbuilder=1&skus=${item.stockNumber}&buynow=0`
        );
    };

    const handleSetBackValue = (item, e) => {
        e.preventDefault();

        var settingCollection = item.collections && item.collections[0] ? item.collections[0].collectionName : 'default';

        if (props.currentMinPrice === "" && props.currentMaxPrice === "") {
            var minpricedata = props.getpriceRangedata && props.getpriceRangedata[0] ? props.getpriceRangedata[0].minPrice : 0;
            var maxpricedata = props.getpriceRangedata && props.getpriceRangedata[0] ? props.getpriceRangedata[0].maxPrice : 10000;
        } else {
            minpricedata = props.currentMinPrice;
            maxpricedata = props.currentMaxPrice;
        }

        var finalSetBackValue = [];
        finalSetBackValue.push({
            shape: props.currentShape,
            collection: props.currentCollection,
            metaltype: props.currentMetalType,
            minprice: minpricedata,
            maxprice: maxpricedata,
            pagesize: props.currentpagesize,
            orderby: props.currentorderby,
            pageno: props.currentpagenovalue,
            settingId: item.settingId,
            tab: props.currenttab,
        });

        setbrowsercookies("shopify_ringbackvalue", finalSetBackValue, {
            path: "/",
            maxAge: 604800,
        });

        if (props.currenttab === "mined") {
            var navsettingurl = "settings/";
        }

        if (props.currenttab === "labgrown") {
            navsettingurl = "labgrownsettings/";
        }

        if (props.currentMetalType) {
            navigate(
                `${RB_BASE}/` +
                    navsettingurl +
                    settingCollection.replace(/\s+/g, "-").toLowerCase() +
                    "/" +
                    props.currentMetalType.replace(/\s+/g, "-").toLowerCase() +
                    "-sku-" +
                    item.priceSettingId
            );
            } else {
                console.log("Trying to access metalType from API response");
                if (item.metalType) {
                    console.log("item.metalType:", item.metalType);
                    navigate(
                        `${RB_BASE}/` +
                            navsettingurl +
                            settingCollection.replace(/\s+/g, "-").toLowerCase() +
                            "/" +
                            item.metalType
                                .replace(/\s+/g, "-")
                                .toLowerCase() +
                            "-sku-" +
                            item.priceSettingId
                    );
                } else {
                    console.log("No metalType in API response, extracting from product name");
                    // Extract metal type from product name as fallback
                    const productName = item.name || '';
                    let extractedMetalType = '14k-white-gold'; // Default fallback
                    
                    // Try to extract metal type from product name
                    if (productName.toLowerCase().includes('14k white gold')) {
                        extractedMetalType = '14k-white-gold';
                    } else if (productName.toLowerCase().includes('14k yellow gold')) {
                        extractedMetalType = '14k-yellow-gold';
                    } else if (productName.toLowerCase().includes('18k white gold')) {
                        extractedMetalType = '18k-white-gold';
                    } else if (productName.toLowerCase().includes('18k yellow gold')) {
                        extractedMetalType = '18k-yellow-gold';
                    } else if (productName.toLowerCase().includes('platinum')) {
                        extractedMetalType = 'platinum';
                    } else if (productName.toLowerCase().includes('14k rose gold')) {
                        extractedMetalType = '14k-rose-gold';
                    } else if (productName.toLowerCase().includes('18k rose gold')) {
                        extractedMetalType = '18k-rose-gold';
                    }
                    
                    navigate(
                        `${RB_BASE}/` +
                            navsettingurl +
                            settingCollection.replace(/\s+/g, "-").toLowerCase() +
                            "/" +
                            extractedMetalType +
                            "-sku-" +
                            item.priceSettingId
                    );
                }
            }
    };

    return (
        <>
            <LoadingOverlay className="_loading_overlay_wrapper">
                <Loader fullPage loading={loaded} />{" "}
            </LoadingOverlay>
            <Modal
                className="gf-video-modal"
                show={modalShow}
                onHide={closehandleModel}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body className="gf-rb-video-modal-body" style={{ position: 'relative', minHeight: '500px' }}>
                    {getvideoloader === "true" ? (
                        <div className="modal__spinner gf-rb-video-modal-spinner" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px', width: '100%' }}>
                            <img
                                className="preloaderr"
                                alt="preLoad"
                                src={
                                    ringGif
                                }
                                style={{ width: "200px", height: "200px" }}
                            />
                        </div>
                    ) : null}
                    {getVideo ? (
                        <VideoFrame
                            src={getVideo}
                            onLoad={spinner}
                            style={{ display: getvideoloader === "true" ? "none" : "block" }}
                        />
                    ) : getvideoloader === "false" ? (
                        <div style={{ textAlign: "center", padding: "50px" }}>
                            <p>Video not available for this setting.</p>
                        </div>
                    ) : null}
                </Modal.Body>
            </Modal>

            <div className="searching-result">
                <div className="result-number">
                    {Number(props.productCount) === 0 ? (
                        <p>No Records Found</p>
                    ) : (
                        <p>
                            {props.productCount} <strong>Settings</strong>
                        </p>
                    )}
                </div>
                <div className="search-details">
                    <div className="change-view-result">
                        <select
                            className="result-pagesize"
                            id="pagesize"
                            name="pagesize"
                            value={getpaginationpagecount}
                            onChange={handlePageSizeChange}
                        >
                            <option value="12">Records Per Page: 12</option>
                            <option value="24">Records Per Page: 24</option>
                            <option value="48">Records Per Page: 48</option>
                            <option value="99">Records Per Page: 99</option>
                        </select>
                    </div>
                    <div className="grid-view-sort">
                        <select
                            name="dropdown-orderby"
                            id="dropdown-sort"
                            className="dropdown-sort"
                            onChange={handlePageAscDesc}
                        >
                            <option value="cost+asc">Price: Low - High</option>
                            <option value="cost+desc">Price: High - Low</option>
                        </select>
                    </div>
                    <div className="change-view">
                        <ul>
                            <li className={`grid-view ${getlithreeClass}`}>
                                <a
                                    href="#"
                                    data-tip="Grid view 3 columns"
                                    id="grid-col-three"
                                    data-grid="grid-col-three"
                                    onClick={gridClassChange}
                                    className="grid-view-three"
                                >
                                    Grid view 3 columns
                                </a>
                            </li>
                            <li className={`grid-view-wide ${getlifourClass}`}>
                                <a
                                    href="#"
                                    data-tip="Grid view 4 columns"
                                    id="grid-col-four"
                                    data-grid="grid-col-four"
                                    onClick={gridClassChange}
                                    className="grid-view-four"
                                >
                                    Grid view 4 columns
                                </a>
                            </li>
                            <ReactTooltip className="ringbuilder_tooltip" />
                        </ul>
                    </div>
                    <div className="search-bar">
                        <form onSubmit={onSubmit}>
                            <input
                                type="text"
                                name="searchdidfield"
                                id="searchdidfield"
                                placeholder="Search Setting#"
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
            <div className="search-product-listing">
                <ul
                    className={`product-grid-view ${getGridClass}`}
                    id="grid-mode"
                >
                    {props.getDataSettingProductData.map((item) => (
                        <li
                            className={`product-listing ${
                                getprouductClass === item.settingId
                                    ? "active"
                                    : ""
                            }`}
                            key={item.$id || item.settingId || item.priceSettingId || Math.random()}
                            id={item.settingId}
                        >
                            <a
                                href="#"
                                className={`video-popup ${
                                    item.videoURL !== "" ? "video-active" : ""
                                }`}
                                onClick={(e) => handleModel(item.settingId, e)}
                            >
                                <i
                                    id={item.settingId}
                                    className="fas fa-video"
                                ></i>
                            </a>
                            <a
                                href="#"
                                onClick={(e) => handleSetBackValue(item, e)}
                            >
                                <div className="product-images">
                                    <ImageLoader src={item.imageUrl}>
                                        <img />
                                        <div>Error!</div>
                                        <div className="image_loaader">
                                            {" "}
                                            <Preloader />{" "}
                                        </div>
                                    </ImageLoader>
                                </div>
                                <div className="gf-product-details">
                                    <h2 className="product-name">
                                        {" "}
                                        <strong> {item.name}</strong>
                                    </h2>
                                    {item.showPrice === true && (
                                        <h5 className="product-price">
                                            {formatPrice(item)}
                                        </h5>
                                    )}
                                    {item.showPrice === false && (
                                        <h5 className="product-price">
                                            {"Call For Price"}
                                        </h5>
                                    )}
                                </div>
                            </a>

                            {(Number(window.initData?.data?.[0]?.display_tryon) === 1 ||
                                window.initData?.data?.[0]?.display_tryon === 'true') && (
                                <a
                                    className="btn btn-tryon"
                                    id={item.settingId}
                                    // onClick={handlevirtual}
                                    onClick={(e) => handlevirtualtryon(item, e)}
                                    href="#"
                                >
                                    Virtual Try On
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {Number(props.productCount) > 0 && (
                <div className="result-pagination">
                <div className="result-bottom">
                    <h2>
                        Results {props.startPage} to {props.endPage} of{" "}
                        {props.productCount}{" "}
                    </h2>
                </div>
                <div className="product-pagination">
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

            {getTryon === "true" && (
                <>
                    <iframe
                        id="tryoniframe"
                        onLoad={() => setLoaded(false)}
                        src={getTryonsrc}
                        allow="camera"
                        width={"100%"}
                        style={{
                            position: "fixed",
                            left: "0",
                            top: "0",
                            overflow: "hidden",
                        }}
                        height={"100%"}
                    ></iframe>
                    <style>
                        {`body{
                    overflow: hidden;
                } 
                #tryoniframe{
                  z-index : 99;
                }
                
                `}
                    </style>
                </>
            )}
        </>
    );
};

export default SettingsProduct;
