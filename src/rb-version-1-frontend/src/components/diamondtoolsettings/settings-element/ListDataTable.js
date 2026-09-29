import React, { useState } from "react";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import spinn from "../../../images/spinner.gif";
import Checkbox from "rc-checkbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModalHeader from "react-bootstrap/ModalHeader";
// import "react-responsive-modal/styles.css";
import { LoadingOverlay, Loader } from "react-overlay-loader";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

// import { Modal } from "react-responsive-modal";

import ReactTooltip from "react-tooltip";
import { formatPrice } from "../../../utils/priceUtils";
import {
    determineDiamondType,
    registerCompareDiamondType,
    removeCompareDiamondType,
} from "../../../utils/compareUtils";
import { RB_BASE, jcVideoUrl, wpFetch } from '../../../wp/wpEnv';
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
    const navigate = useNavigate();

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
    const [open, setOpen] = useState(false);
    const [getInfo, setInfo] = useState("");

    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);

    const [getVideo, setVideo] = useState(true);
    const [getView, setView] = useState(true);
    const [getRow, setRow] = useState(true);
    const [modalShow, setModalShow] = useState(false);
    // const [videoLoading, setVideoLoading] = useState(true);
    // const [getCompareCount, setCompareCount] = useState(0);

    const [getvideoloader, setvideoloader] = useState("true");
    const [getShapeOrderType, setShapeOrderType] = useState("");
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
    const [loaded, setLoaded] = useState(false);

    const [getbrowserdiamondcookies, setbrowserdiamondcookies] = useCookies([
        "shopify_diamondbackvalue",
    ]);

    const spinner = () => {
        // setTimeout(() => {
        setvideoloader("false");
        // }, 500);
    };
    const onClickRow = (e) => {
        e.preventDefault();
        setRow(true);
    };

    const handleShow = async (e) => {
        setLoaded(true);
        e.preventDefault();
        var currentId = e.target.id;
        var tab = props.tabname;

        try {
            if (tab === "labgrown") {
                var url = `${window.initData.data[0].diamonddetailapi}DealerID=${window.initData.data[0].dealerid}&DID=${currentId}&IsLabGrown=true`;
            } else if (tab === "fancycolor") {
                var url = `${window.initData.data[0].diamonddetailapi}DealerID=${window.initData.data[0].dealerid}&DID=${currentId}&IsFancy=true`;
            } else {
                var url = `${window.initData.data[0].diamonddetailapi}DealerID=${window.initData.data[0].dealerid}&DID=${currentId}&IsLabGrown=false`;
            }

            const res = await wpFetch(url);
            const productDetails = await res.json();
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
        } catch (error) {
            console.log(error);
        }
        setLoaded(false);
    };

    const onClickShape = (e) => {
        if (getShapeOrderType === "ASC") {
            setShapeOrderType("DESC");
        } else {
            setShapeOrderType("ASC");
        }
        props.filtershape(e);
    };

    const onClickPrice = (e) => {
        e.preventDefault();
        if (getPriceOrderType === "ASC") {
            setPriceOrderType("DESC");
        } else {
            setPriceOrderType("ASC");
        }
        props.filterPrice(e);
    };

    const onClickCarat = (e) => {
        e.preventDefault();
        if (getCaratOrderType === "ASC") {
            setCaratOrderType("DESC");
        } else {
            setCaratOrderType("ASC");
        }
        props.filterCarat(e);
    };

    const onClickColor = (e) => {
        e.preventDefault();
        if (getColorOrderType === "ASC") {
            setColorOrderType("DESC");
        } else {
            setColorOrderType("ASC");
        }
        props.filterColor(e);
    };
    const onClickIntensity = (e) => {
        e.preventDefault();
        if (getIntensityOrderType === "ASC") {
            setIntensityOrderType("DESC");
        } else {
            setIntensityOrderType("ASC");
        }
        props.filterIntensity(e);
    };
    const onClickClarity = (e) => {
        e.preventDefault();
        if (getClarityOrderType === "ASC") {
            setClarityOrderType("DESC");
        } else {
            setClarityOrderType("ASC");
        }
        props.filterClarity(e);
    };

    const onClickDepth = (e) => {
        e.preventDefault();
        if (getDepthOrderType === "ASC") {
            setDepthOrderType("DESC");
        } else {
            setDepthOrderType("ASC");
        }
        props.filterDepth(e);
    };
    const onClickTable = (e) => {
        e.preventDefault();
        if (getTableOrderType === "ASC") {
            setTableOrderType("DESC");
        } else {
            setTableOrderType("ASC");
        }
        props.filterTable(e);
    };
    const onClickPolish = (e) => {
        e.preventDefault();
        if (getPolishOrderType === "ASC") {
            setPolishOrderType("DESC");
        } else {
            setPolishOrderType("ASC");
        }
        props.filterPolish(e);
    };
    const onClickMeasurement = (e) => {
        e.preventDefault();
        if (getMeasurementOrderType === "ASC") {
            setMeasurementOrderType("DESC");
        } else {
            setMeasurementOrderType("ASC");
        }
        props.filterMeasurement(e);
    };
    const onClickCertificate = (e) => {
        e.preventDefault();
        if (getCertificateOrderType === "ASC") {
            setCertificateOrderType("DESC");
        } else {
            setCertificateOrderType("ASC");
        }
        props.filterCertificate(e);
    };
    const onClickCut = (e) => {
        e.preventDefault();
        if (getCutOrderType === "ASC") {
            setCutOrderType("DESC");
        } else {
            setCutOrderType("ASC");
        }
        props.filterCut(e);
    };

    const onClickSymmetry = (e) => {
        e.preventDefault();
        if (getSymmetryOrderType === "ASC") {
            setSymmetryOrderType("DESC");
        } else {
            setSymmetryOrderType("ASC");
        }
        props.filterSummery(e);
    };

    const onClickVideo = (e) => {
        e.preventDefault();
        setView(true);
    };

    const onClickView = (e) => {
        e.preventDefault();
        setRow(true);
    };

    const handleClose = () => {
        setShow(false);
    };

    const closehandleModel = async (event) => {
        setModalShow(false);
    };

    const handleModel = async (event) => {
        setvideoloader("true");
        try {
            const res = await wpFetch(
                `${window.initData?.data?.[0]?.videoapi || jcVideoUrl()}InventoryID=${event.target.id}&Type=Diamond`
            );
            const geturl = await res.json();
            setVideo(geturl.videoURL);
            setModalShow(true);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCompare = (checked, item) => {
        console.log('[LIST] handleCompare called', { checked, item });
        
        if (!Array.isArray(window.compareproduct)) {
            window.compareproduct = [];
        }

        const diamondId = item?.diamondId;
        const diamondType = determineDiamondType(item);

        console.log('[LIST] Diamond info', { diamondId, diamondType, item, checked });

        if (!diamondId) {
            console.warn('[LIST] No diamondId found');
            return;
        }

        if (checked === false) {
            console.log('[LIST] Unchecking diamond', diamondId);
            const index = window.compareproduct.indexOf(diamondId);
            if (index !== -1) {
                window.compareproduct.splice(index, 1);
            }
            removeCompareDiamondType(diamondId);
        } else {
            console.log('[LIST] Checking diamond', diamondId);
            if (window.compareproduct.length >= 6) {
                toast("You can not add more than 6 products.");
                return;
            }

            if (window.compareproduct.indexOf(diamondId) === -1) {
                window.compareproduct.push(diamondId);
            }
            console.log('[LIST] About to register diamond type', { diamondId, diamondType });
            registerCompareDiamondType(diamondId, diamondType);
        }
        props.checkboxcount(window.compareproduct.length);
    };

    const handleSetBackValue = (item, e) => {
        e.preventDefault();

        var finalSetBackValue = [];
        finalSetBackValue.push({
            shapeName: props.selectValue.shapeName,
            selectedCut: props.selectValue.selectedCut,
            selectedColor: props.selectValue.selectedColor,
            selectedClarity: props.selectValue.selectedClarity,
            caratmin: props.selectValue.caratmin,
            caratmax: props.selectValue.caratmax,
            pricemin: props.selectValue.pricemin,
            pricemax: props.selectValue.pricemax,
            selectedFlour: props.selectValue.selectedFlour,
            selectedPolish: props.selectValue.selectedPolish,
            selectedfancyColor: props.selectValue.selectedfancyColor,
            selectedfancyIntensity: props.selectValue.selectedfancyIntensity,
            selectedmaxDept: props.selectValue.selectedmaxDept,
            selectedminDept: props.selectValue.selectedminDept,
            selectedmaxtable: props.selectValue.selectedmaxtable,
            selectedmintable: props.selectValue.selectedmintable,
            selectedSymmetry: props.selectValue.selectedSymmetry,
            diamondId: item.diamondId,
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
            // window.location.reload();
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
            // window.location.reload();
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
            // window.location.reload();
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
    if (props.listviewData[0]) {
        var isShowPrice = props.listviewData[0].showPrice;
    } else {
        var isShowPrice = "";
    }
    const handleUrl = (e) => {};
    return (
        <>
            <LoadingOverlay className="_loading_overlay_wrapper">
                <Loader fullPage loading={loaded} />{" "}
            </LoadingOverlay>
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
                    <VideoFrame
                        src={getVideo}
                        onLoad={spinner}
                    />
                </Modal.Body>
            </Modal>

            <div className="product-list-viewdata">
                <Table responsive="sm">
                    <thead>
                        <tr>
                            <th scope="col">
                                <i className="fas fa-clone"></i>
                            </th>
                            <th
                                scope="col"
                                className={`table-sort ${getShapeOrderType}`}
                                title="Shape"
                                id="Cut"
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
                                {isShowPrice === true
                                    ? ` ( ${window.initData.data[0].currencyFrom} ) `
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
                            <th
                                scope="col"
                                className="all-data"
                                id="diamond-data-icon"
                            ></th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.listviewData.map((item, index) => (
                            <tr
                                key={item.$id || item.diamondId || `table-row-${index}`}
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
                            >
                                <th scope="row" className="table-selecter">
                                    {window.compareproduct.indexOf(
                                        item.diamondId
                                    ) >
                                        -1 ==
                                        true && (
                                        <label>
                                            <Checkbox
                                                value={item.diamondId}
                                                onChange={(checked) =>
                                                    handleCompare(checked, item)
                                                }
                                                checked={true}
                                            />
                                        </label>
                                    )}
                                    {window.compareproduct.indexOf(
                                        item.diamondId
                                    ) >
                                        -1 ==
                                        false && (
                                        <label>
                                            <Checkbox
                                                value={item.diamondId}
                                                onChange={(checked) =>
                                                    handleCompare(checked, item)
                                                }
                                            />
                                        </label>
                                    )}
                                </th>
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
                                    {" "}
                                    {item.table ? item.table : "-"}{" "}
                                </td>
                                {/* <td className="Polishcol">{functionWithSwitch(item.polish)}</td>
                <td className="Symmetrycol">
                  {functionWithSwitch(item.symmetry)}
                </td>
                <td className="Measurementscol">
                  {" "}
                  {item.measurement ? item.measurement : "-"}{" "}
                </td> */}
                                <td className="Certificatecol">
                                    {" "}
                                    <a href={item.certificateUrl}>
                                        {item.cert ? item.cert : "-"}
                                    </a>{" "}
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
                      href="#"
                      className={`video-popup ${
                        item.videoFileName !== "" ? "video-active" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleModel(e);
                      }}
                    >
                      <i id={item.diamondId} className="fas fa-video"></i>
                    </a>
                  )}
                </td>
                <td className="view-data dia_viewcol">
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
                                                        href="#"
                                                        className={`video-popup ${
                                                            item.videoFileName !==
                                                            ""
                                                                ? "video-active"
                                                                : ""
                                                        }`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleModel(e);
                                                        }}
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
                                        {/* <div className="video-icon">
                      {" "}
                      <i id={item.diamondId} className="fas fa-video"></i>
                    </div> */}
                                        <div className="view-icon">
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleSetBackValue(item, e);
                                                }}
                                                data-tip="View Diamond Details"
                                                title="View Diamond Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </a>
                                            <ReactTooltip />
                                        </div>

                                        <div
                                            className="info-icon"
                                            onClick={handleShow}
                                        >
                                            <>
                                                <i
                                                    id={item.diamondId}
                                                    className="fas fa-info"
                                                    data-tip="Quick View"
                                                ></i>
                                                <ReactTooltip />
                                            </>
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
                                                                        // Get currency info from the item
                                                                        return formatPrice({
                                                                            fltPrice: getPrice,
                                                                            currencyFrom: item?.currencyFrom,
                                                                            currencySymbol: item?.currencySymbol
                                                                        });
                                                                    })()}
                                                                </p>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </Modal.Body>
                                        </Modal>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </>
    );
};

export default ListDataTable;
