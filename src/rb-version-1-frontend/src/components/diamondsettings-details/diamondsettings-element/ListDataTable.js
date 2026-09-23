import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import round from "../../../images/round.png";
import Modal from "react-bootstrap/Modal";
import spinn from "../../../images/spinner.gif";
import { useCookies } from "react-cookie";
import Checkbox from "rc-checkbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingOverlay, Loader } from "react-overlay-loader";
import ReactTooltip from "react-tooltip";
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
import formatMeasurement from "../../../utils/formatMeasurement";
import VideoFrame from "../../elements/VideoFrame";

function Preloader(props) {
    return (
        <img
            className="preloaderr"
            alt="spinner"
            src={
                spinnerGif
            }
            style={{ width: "21px", height: "24px" }}
        />
    );
}

const ListDataTable = (props) => {
    const [getshow, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const navigate = useNavigate();

    // Initialize compareproduct array if it doesn't exist
    if (!window.compareproduct) {
        window.compareproduct = [];
    }

    const [getDiamondID, setDiamondID] = useState(true);
    const [getShape, setShape] = useState(true);
    const [getCarat, setCarat] = useState(true);
    const [getColor, setColor] = useState(true);
    const [getClarity, setClarity] = useState(true);
    const [getDepth, setDepth] = useState(true);
    const [getTable, setTable] = useState(true);
    const [getPolish, setPolish] = useState(true);
    const [getMeasurement, setMeasurement] = useState(true);
    const [getCertificate, setCertificate] = useState(true);
    const [getPrice, setPrice] = useState(true);
    const [getSymmetry, setSymmetry] = useState(true);
    const [getCut, setCut] = useState(true);
    const [getVideo, setVideo] = useState("");
    const [getView, setView] = useState(true);
    const [getRow, setRow] = useState(true);
    const [modalShow, setModalShow] = useState(false);
    const [videoLoading, setVideoLoading] = useState(true);
    const [getCompareCount, setCompareCount] = useState(0);
    const [getvideoloader, setvideoloader] = useState("true");
    const [getShapeOrderType, setShapeOrderType] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [getOrderType, setOrderType] = useState("");
    const [getPriceOrderType, setPriceOrderType] = useState("");
    const [getCaratOrderType, setCaratOrderType] = useState("");
    const [getColorOrderType, setColorOrderType] = useState("");
    const [getIntensityOrderType, setIntensityOrderType] = useState("");
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
    const closehandleModel = async (event) => {
        setModalShow(false);
    };

    const onClickRow = (e) => {
        e.preventDefault();
        setRow(true);
    };

    const onClickShape = (e) => {
        const next = getShapeOrderType === "ASC" ? "DESC" : "ASC";
        setShapeOrderType(next);
        props.filtershape(e, next);
    };

    const onClickPrice = (e) => {
        e.preventDefault();
        const next = getPriceOrderType === "ASC" ? "DESC" : "ASC";
        setPriceOrderType(next);
        props.filterPrice(e, next);
    };

    const onClickCarat = (e) => {
        e.preventDefault();
        const next = getCaratOrderType === "ASC" ? "DESC" : "ASC";
        setCaratOrderType(next);
        props.filterCarat(e, next);
    };

    const onClickColor = (e) => {
        e.preventDefault();
        const next = getColorOrderType === "ASC" ? "DESC" : "ASC";
        setColorOrderType(next);
        props.filterColor(e, next);
    };

    const onClickIntensity = (e) => {
        e.preventDefault();
        const next = getIntensityOrderType === "ASC" ? "DESC" : "ASC";
        setIntensityOrderType(next);
        props.filterIntensity(e, next);
    };

    const onClickClarity = (e) => {
        e.preventDefault();
        const next = getClarityOrderType === "ASC" ? "DESC" : "ASC";
        setClarityOrderType(next);
        props.filterClarity(e, next);
    };

    const onClickDepth = (e) => {
        e.preventDefault();
        const next = getDepthOrderType === "ASC" ? "DESC" : "ASC";
        setDepthOrderType(next);
        props.filterDepth(e, next);
    };
    const onClickTable = (e) => {
        e.preventDefault();
        const next = getTableOrderType === "ASC" ? "DESC" : "ASC";
        setTableOrderType(next);
        props.filterTable(e, next);
    };
    const onClickPolish = (e) => {
        e.preventDefault();
        const next = getPolishOrderType === "ASC" ? "DESC" : "ASC";
        setPolishOrderType(next);
        props.filterPolish(e, next);
    };
    const onClickMeasurement = (e) => {
        e.preventDefault();
        const next = getMeasurementOrderType === "ASC" ? "DESC" : "ASC";
        setMeasurementOrderType(next);
        props.filterMeasurement(e, next);
    };
    const onClickCertificate = (e) => {
        e.preventDefault();
        const next = getCertificateOrderType === "ASC" ? "DESC" : "ASC";
        setCertificateOrderType(next);
        props.filterCertificate(e, next);
    };
    const onClickCut = (e) => {
        e.preventDefault();
        const next = getCutOrderType === "ASC" ? "DESC" : "ASC";
        setCutOrderType(next);
        props.filterCut(e, next);
    };

    const onClickSymmetry = (e) => {
        e.preventDefault();
        const next = getSymmetryOrderType === "ASC" ? "DESC" : "ASC";
        setSymmetryOrderType(next);
        props.filterSummery(e, next);
    };

    const onClickVideo = (e) => {
        e.preventDefault();
        setView(true);
    };

    const onClickView = (e) => {
        e.preventDefault();
        setRow(true);
    };

    const handleShow = async (item, e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoaded(true);

        var currentId = item.diamondId;
        var tab = props.tabname;

        try {
            if (item.isLabCreated === true || item.isLabCreated === "true") {
                var url = `${window.initData.data[0].diamonddetailapi}DealerID=${window.initData.data[0].dealerid}&DID=${currentId}&IsLabGrown=true`;
                var diamondType = "labcreated";
            } else if (item.fancyColorIntensity) {
                var url = `${window.initData.data[0].diamonddetailapi}DealerID=${window.initData.data[0].dealerid}&DID=${currentId}&IsFancy=true`;
                var diamondType = "fancydiamonds";
            } else {
                var url = `${window.initData.data[0].diamonddetailapi}DealerID=${window.initData.data[0].dealerid}&DID=${currentId}&IsLabGrown=false`;
                var diamondType = "mined";
            }

            const res = await fetch(url);
            const productDetails = await res.json();
            // console.log(productDetails);
            setDiamondID(currentId);
            setShape(productDetails.shape);
            setCarat(productDetails.caratWeight);
            setColor(productDetails.color);
            setClarity(productDetails.clarity);
            setDepth(productDetails.depth);
            setCut(productDetails.cut);
            setTable(productDetails.table);
            setPolish(productDetails.polish);
            setMeasurement(productDetails.measurement);
            setCertificate(productDetails.certificate);
            setPrice(productDetails.fltPrice);
            setSymmetry(productDetails.symmetry);
            setShow(true);
            //console.log(productId);
        } catch (error) {
            console.log(error);
        }
        setLoaded(false);
    };

    const handleModel = async (diamondId, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
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

    const handleSetBackValue = (item, e) => {
        e.preventDefault();
        // console.log(props);

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
    };

    const functionWithSwitch = (param) => {
        switch (param) {
            case "Good":
                return "G";
            case "Very good":
                return "VG";
            case "Excellent":
                return "Ex";
            case "Fair":
                return "F";
            case "Ideal":
                return "I";
            default:
                return "-";
        }
    };
    const handleUrl = (e) => {
        // Get the diamond item from the clicked row
        const row = e.currentTarget;
        const diamondId = row.getAttribute('data-diamond-id');
        const item = props.listviewData.find(diamond => diamond.diamondId === diamondId);
        
        if (item) {
            handleSetBackValue(item, e);
        }
    };
    if (props.listviewData[0]) {
        var isShowPrice = props.listviewData[0].showPrice;
    } else {
        var isShowPrice = "";
    }

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
                <Modal.Body className="gf-rb-video-modal-body" style={{ minHeight: "500px" }}>
                    {getvideoloader === "true" ? (
                        <div className="modal__spinner gf-rb-video-modal-spinner">
                            <img
                                className="preloaderr"
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
                    {getVideo ? (
                        <VideoFrame
                            src={getVideo}
                            onLoad={spinner}
                        />
                    ) : getvideoloader === "false" ? (
                        <div style={{ textAlign: "center", padding: "50px" }}>
                            <p>Video not available for this diamond.</p>
                        </div>
                    ) : null}
                </Modal.Body>
            </Modal>
            <div className="product-list-viewdata">
                <Table responsive="sm" className="gf-table-responsive">
                    <thead>
                        <tr>
                            <th scope="col" className="table-selecter">
                                <i className="fas fa-clone"></i>
                            </th>
                            <th
                                scope="col"
                                className={`table-sort ${getShapeOrderType}`}
                                title="Shape"
                                id="shape"
                                onClick={onClickShape}
                            >
                                Shape
                            </th>
                            <th
                                scope="col"
                                className={`table-sort ${getCaratOrderType}`}
                                title="Carat"
                                id="Size"
                                onClick={onClickCarat}
                            >
                                Carat
                            </th>
                            <th
                                scope="col"
                                className={`table-sort ${getColorOrderType}`}
                                title="Color"
                                id="Color"
                                onClick={onClickColor}
                            >
                                Color
                            </th>
                            {props.tabname === "fancycolor" && (
                                <th
                                    scope="col"
                                    className={`table-sort ${getIntensityOrderType}`}
                                    title="Intensity"
                                    id="FancyColorIntensity"
                                    onClick={onClickIntensity}
                                >
                                    Intensity
                                </th>
                            )}
                            <th
                                scope="col"
                                className={`table-sort ${getClarityOrderType}`}
                                title="Clarity"
                                id="ClarityID"
                                onClick={onClickClarity}
                            >
                                Clarity
                            </th>
                            <th
                                scope="col"
                                className={`table-sort ${getCutOrderType}`}
                                title="Cut"
                                id="CutGrade"
                                onClick={onClickCut}
                            >
                                Cut
                            </th>
                            <th
                                scope="col"
                                className={`table-sort ${getDepthOrderType}`}
                                id="Depth"
                                title="Depth"
                                onClick={onClickDepth}
                            >
                                Depth
                            </th>
                            <th
                                scope="col"
                                className={`table-sort ${getTableOrderType}`}
                                id="TableMeasure"
                                title="Table"
                                onClick={onClickTable}
                            >
                                Table
                            </th>
                            {/* <th
                scope="col"
                className={`table-sort ${getPolishOrderType}`}
                id="Polish"
                title="Polish"
                onClick={onClickPolish}
              >
                Polish
              </th>
              <th
                scope="col"
                className={`table-sort ${getSymmetryOrderType}`}
                id="Symmetry"
                title="Symmetry"
                onClick={onClickSymmetry}
              >
                Sym.
              </th>
              <th
                scope="col"
                className={`table-sort ${getMeasurementOrderType}`}
                id="Measurements"
                title="Measurement"
                onClick={onClickMeasurement}
              >
                Measurement
              </th> */}
                            <th
                                scope="col"
                                className={`table-sort ${getCertificateOrderType}`}
                                id="Certificate"
                                title="Certificate"
                                onClick={onClickCertificate}
                            >
                                Cert.
                            </th>
                            <th
                                scope="col"
                                className={`table-sort ${getPriceOrderType}`}
                                id="FltPrice"
                                title="Price"
                                onClick={onClickPrice}
                            >
                                Price
                                {isShowPrice === true && props.listviewData[0]
                                    ? ` ( ${props.listviewData[0].currencyFrom} ) `
                                    : ""}
                            </th>
                            {/* <th
                scope="col"
                className="video-data"
                id="dia_video"
                onClick={onClickVideo}
              >
                Video
              </th>
              <th
                scope="col"
                className="view-data"
                id="dia_view"
                onClick={onClickView}
              >
                View
              </th> */}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.listviewData.map((item) => (
                            <tr
                                key={item.$id}
                                data-diamond-id={item.diamondId}
                                className={`${
                                    window.compareproduct.indexOf(
                                        item.diamondId
                                    ) >
                                        -1 ===
                                    true
                                        ? "selected_row"
                                        : ""
                                }`}
                                onClick={handleUrl}
                                style={{ cursor: 'pointer' }}
                            >
                                <td 
                                    scope="row" 
                                    className="table-selecter"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Toggle selection
                                        const isSelected = window.compareproduct.indexOf(item.diamondId) > -1;
                                        if (isSelected) {
                                            // Remove from selection
                                            const index = window.compareproduct.indexOf(item.diamondId);
                                            if (index !== -1) {
                                                window.compareproduct.splice(index, 1);
                                            }
                                            removeCompareDiamondType(item.diamondId);
                                        } else {
                                            // Add to selection (with 6 item limit)
                                            if (window.compareproduct.length < 6) {
                                                window.compareproduct.push(item.diamondId);
                                                registerCompareDiamondType(
                                                    item.diamondId,
                                                    determineDiamondType(item)
                                                );
                                            } else {
                                                toast("You can not add more than 6 products.");
                                                return;
                                            }
                                        }
                                        props.checkboxcount(window.compareproduct.length);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <label style={{ cursor: 'pointer', margin: 0 }}>
                                        <Checkbox
                                            value={item.diamondId}
                                            checked={window.compareproduct.indexOf(item.diamondId) > -1}
                                            readOnly
                                        />
                                    </label>
                                </td>
                                <td className="Cutcol">
                                    <img
                                        src={item.biggerDiamondimage}
                                        alt={item.detailLinkText}
                                        width="20"
                                        height="20"
                                        title={
                                            item.shape +
                                            " " +
                                            item.carat +
                                            " CARAT"
                                        }
                                        style={{ width: '100%', maxWidth: '20px' }}
                                    />
                                    <span className="shape-name">
                                        {item.shape}
                                    </span>
                                </td>
                                <td className="Sizecol">
                                    {" "}
                                    {item.carat ? item.carat : "-"}{" "}
                                </td>
                                <td className="Colorcol">
                                    {" "}
                                    {item.color ? item.color : "-"}{" "}
                                </td>
                                {props.tabname === "fancycolor" && (
                                    <td className="Intensitycol">
                                        {item.fancyColorIntensity
                                            ? item.fancyColorIntensity
                                            : "-"}
                                    </td>
                                )}
                                <td className="ClarityIDcol">
                                    {item.clarity ? item.clarity : "-"}
                                </td>
                                <td className="CutGradecol">
                                    {" "}
                                    {functionWithSwitch(item.cut)}
                                </td>
                                <td className="Depthcol">
                                    {" "}
                                    {item.depth ? item.depth : "-"}{" "}
                                </td>
                                <td className="TableMeasurecol">
                                    {item.table ? item.table : "-"}
                                </td>
                                {/* <td className="Polishcol">{functionWithSwitch(item.polish)}</td>
                <td className="Symmetrycol">
                  {functionWithSwitch(item.symmetry)}
                </td>
                <td className="Measurementscol">
                  {item.measurement ? item.measurement : "-"}
                </td> */}
                                <td className="Certificatecol">
                                    <a href={item.certificateUrl}>
                                        {item.cert ? item.cert : "-"}
                                    </a>
                                </td>
                                <td className="FltPricecol">
                                    {formatPrice(item)}
                                </td>
                                {/* <td
                  className={`video-data dia_videocol ${
                    item.videoFileName !== "" ? "video-active" : ""
                  }`}
                >
                  {item.videoFileName !== "" && (
                    <a
                      href="javascript:;"
                      className={`video-popup ${
                        item.videoFileName !== "" ? "video-active" : ""
                      }`}
                      onClick={handleModel}
                    >
                      <i id={item.diamondId} className="fas fa-video"></i>
                    </a>
                  )}
                </td> */}
                                {/* <td className="view-data dia_viewcol">
                  <a
                    href={
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
                      "-cert-" +
                      "islabgrown-" +
                      item.isLabCreated +
                      "-sku-" +
                      item.diamondId
                    }
                    title="View Diamond"
                  >
                    <i className="fas fa-eye"></i>
                  </a>
                </td> */}
                                <td className="ellipsis-data">
                                    <div className="info-diamond">
                                        <i className="fas fa-ellipsis-v"></i>
                                    </div>
                                    <div className="icon-hover">
                                        <div
                                            className={`video-icon video-data dia_videocol ${
                                                item.videoFileName !== ""
                                                    ? "video-active"
                                                    : ""
                                            }`}
                                        >
                                            {item.videoFileName !== "" && (
                                                <>
                                                    <a
                                                        href="javascript:;"
                                                        className={`video-popup ${
                                                            item.videoFileName !==
                                                            ""
                                                                ? "video-active"
                                                                : ""
                                                        }`}
                                                        onClick={(e) => handleModel(item.diamondId, e)}
                                                        data-tip="Video"
                                                    >
                                                        <i
                                                            id={item.diamondId}
                                                            className="fas fa-video"
                                                        ></i>
                                                    </a>

                                                    <ReactTooltip />
                                                </>
                                            )}
                                        </div>
                                        <div className="view-icon">
                                            <>
                                                <a
                                                    href="javascript:;"
                                                    onClick={(e) =>
                                                        handleSetBackValue(
                                                            item,
                                                            e
                                                        )
                                                    }
                                                    data-tip="View Diamond Details"
                                                    title="View Diamond Details"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </a>
                                                <ReactTooltip />
                                            </>
                                        </div>
                                        <div className="info-icon">
                                            <>
                                            <a
                                                href="javascript:;"
                                                onClick={(e) => handleShow(item, e)}
                                                data-tip="Quick View"
                                                title="Quick View"
                                            >
                                                <i
                                                    id={item.diamondId}
                                                    className="fas fa-info"
                                                ></i>
                                            </a>
                                            <ReactTooltip />
                                            </>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            <Modal
                show={getshow}
                className="gf-spec-bs-modal"
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header
                    closeButton
                    onClick={handleClose}
                >
                    <Modal.Title>
                        Additional Information
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="diamond-information">
                        <ul className="diamond-spacification-list">
                            <li>
                                <div className="diamonds-details-title">
                                    <p>
                                        Diamond ID
                                    </p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {getDiamondID
                                            ? getDiamondID
                                            : "NA"}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="diamonds-details-title">
                                    <p>Shape</p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {getShape
                                            ? getShape
                                            : "NA"}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="diamonds-details-title">
                                    <p>Carat</p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {getCarat
                                            ? getCarat
                                            : "NA"}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="diamonds-details-title">
                                    <p>Color</p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {getColor
                                            ? getColor
                                            : "NA"}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="diamonds-details-title">
                                    <p>Clarity</p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {getClarity
                                            ? getClarity
                                            : "NA"}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="diamonds-details-title">
                                    <p>Cut</p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {getCut
                                            ? getCut
                                            : "NA"}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="diamonds-details-title">
                                    <p>Depth %</p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {getDepth
                                            ? getDepth
                                            : "NA"}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="diamonds-details-title">
                                    <p>Table %</p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {getTable
                                            ? getTable
                                            : "NA"}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="diamonds-details-title">
                                    <p>Polish</p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {getPolish
                                            ? getPolish
                                            : "NA"}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="diamonds-details-title">
                                    <p>Symmetry</p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {getSymmetry
                                            ? getSymmetry
                                            : "NA"}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="diamonds-details-title">
                                    <p>
                                        Measurement
                                    </p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {getMeasurement
                                            ? formatMeasurement(getMeasurement)
                                            : "NA"}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="diamonds-details-title">
                                    <p>
                                        Certificate
                                    </p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {getCertificate
                                            ? getCertificate
                                            : "NA"}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="diamonds-details-title">
                                    <p>Price</p>
                                </div>
                                <div className="diamonds-info">
                                    <p>
                                        {(() => {
                                            // Get currency info from the first item
                                            const firstItem = props.listviewData && props.listviewData[0];
                                            return formatPrice({
                                                fltPrice: getPrice,
                                                currencyFrom: firstItem?.currencyFrom,
                                                currencySymbol: firstItem?.currencySymbol
                                            });
                                        })()}
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ListDataTable;
