import React, { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
import ImageLoader from "react-load-image";
import { Modal } from "react-responsive-modal";
import marquise from "../../../images/marquise_Large.png";
import diamondgrade from "../../../images/diamond-info.png";
import videoimage from "../../../images/360-view.png";
import Skeleton from "react-loading-skeleton";
import { LoadingOverlay, Loader } from "react-overlay-loader";
import spinnerGif from '../../../images/spinner.gif';
import view360Png from '../../../images/360-view.png';

const DiamondProductGallary = (props) => {
    const [getVideo, setVideo] = useState(true);
    const [getImage, setImage] = useState(false);
    const [getDefaultImage, setDefaultImage] = useState("");
    const [selectedImage, setselectedImage] = useState("");
    const [selectedvideo, setselectedvideo] = useState(true);
    const [loaded, setLoaded] = useState(false);

    const [open, setOpen] = useState(false);
    const onCloseModal = () => setOpen(false);

    const [openVideo, setOpenVideo] = useState(false);

    const onOpenModalVideo = () => setOpenVideo(true);
    const onCloseModalVideo = () => {
        setOpenVideo(false);
    };

    // Certificate values of 0 / "None" / "Uncertified" mean there is no
    // grading report to show, so the report link and grade badge are hidden.
    const certificateValue = String(props.productDetailsData.certificate ?? "")
        .trim()
        .toLowerCase();
    const hasCertificate =
        certificateValue !== "" &&
        certificateValue !== "0" &&
        certificateValue !== "none" &&
        certificateValue !== "uncertified";

    const changevideo = (e) => {
        e.preventDefault();
        setVideo(true);
        setImage(false);
        setselectedvideo(true);
        setselectedImage("");
    };

    const changeimage = (e) => {
        e.preventDefault();
        setselectedImage(e.target.id);
        setDefaultImage(e.target.src);
        setVideo(false);
        setImage(true);
        setselectedvideo(false);
    };

    useEffect(() => {
        if (props.productDetailsData.videoFileName) {
            setVideo(true);
            setImage(false);
            setselectedvideo(true);
        } else {
            setVideo(false);
            setImage(true);
            setselectedvideo(false);
        }
        // setDefaultImage(props.productDetailsData.defaultDiamondImage);

        if (props.productDetailsData.image2) {
            setDefaultImage(props.productDetailsData.image2);
        } else if (props.productDetailsData.colorDiamond) {
            setDefaultImage(props.productDetailsData.colorDiamond);
        } else {
            setDefaultImage(props.productDetailsData.defaultDiamondImage);
        }
    }, []);

    var imagesGallery = [];
    if (props.productDetailsData.image1) {
        imagesGallery.push({ thumbnail: props.productDetailsData.image1 });
    }
    // if(props.productDetailsData.image2){
    //   imagesGallery.push({'thumbnail':props.productDetailsData.image2})
    // }
    // if (props.productDetailsData.defaultDiamondImage) {
    //     imagesGallery.push({
    //         thumbnail: props.productDetailsData.defaultDiamondImage,
    //     });
    // }

    if (props.productDetailsData.image2) {
        imagesGallery.push({
            thumbnail: props.productDetailsData.image2,
        });
    } else if (props.productDetailsData.colorDiamond) {
        imagesGallery.push({
            thumbnail: props.productDetailsData.colorDiamond,
        });
    } else {
        imagesGallery.push({
            thumbnail: props.productDetailsData.defaultDiamondImage,
        });
    }

    function PreloaderImage(props) {
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
    return (
        <>
            <div className="product-image-gallary">
                <div className={`thumbnailimage image-thumb-image`}>
                    <ul className="image-gallary-box">
                        {props.productDetailsData.videoFileName !== "" ? (
                            <li
                                onClick={onOpenModalVideo}
                                className={`image-gallary-list ${
                                    selectedvideo === true ? "active" : ""
                                } `}
                            >
                                <ImageLoader
                                    src={
                                        view360Png
                                    }
                                >
                                    <img id={-1} alt="product-gallery" />
                                    <div>Error!</div>
                                    <div className="image_loaader">
                                        {" "}
                                        <PreloaderImage />{" "}
                                    </div>
                                </ImageLoader>
                            </li>
                        ) : (
                            ""
                        )}

                        <Modal
                            open={openVideo}
                            onClose={onCloseModalVideo}
                            center
                        >
                            <div className={`ring-diamond-video active`}>
                                <LoadingOverlay className="_loading_overlay_wrapper">
                                    <Loader fullPage loading={loaded} />
                                </LoadingOverlay>
                                <iframe
                                    src={props.productDetailsData.videoFileName}
                                    id="iframevideo"
                                    width="560"
                                    height="430"
                                    scrolling="no"
                                ></iframe>
                            </div>
                        </Modal>

                        {imagesGallery.map((val, index) => (
                            <li
                                key={index}
                                onClick={changeimage}
                                className={`image-gallary-list ${
                                    selectedImage === index.toString()
                                        ? "active"
                                        : ""
                                }`}
                            >
                                <ImageLoader src={val.thumbnail}>
                                    <img id={index} alt="product-gallery" />
                                    <div>Error!</div>
                                    <div className="image_loaader">
                                        {" "}
                                        <PreloaderImage />{" "}
                                    </div>
                                </ImageLoader>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* <div
          className={`ring-diamond-video ${getVideo === true ? "active" : ""} `}
        >
          <iframe
            src={props.productDetailsData.videoFileName}
            id="iframevideo"
            width="560"
            height="350"
            scrolling="no"
          ></iframe>
        </div> */}
                <div className={`ring-diamond-image-dia active`}>
                    <ImageLoader src={getDefaultImage}>
                        <img alt="product-gallery" />
                        <div>Error!</div>
                        <div className="image_loaader">
                            {" "}
                            <PreloaderImage />{" "}
                        </div>
                    </ImageLoader>
                </div>
                <div className="product-skus">
                    <h2>SKU#{props.productDetailsData.diamondId}</h2>
                </div>
                {hasCertificate && (
                    <>
                        <div className="diamond-report-link">
                            {props.productDetailsData.certificateUrl !== "" && (
                                <p>
                                    <strong>Diamond Grading Report</strong>{" "}
                                    <a
                                        href="javascript:;"
                                        onClick={() =>
                                            window.open(
                                                props.productDetailsData.certificateUrl,
                                                "CERTVIEW",
                                                "scrollbars=yes,resizable=yes,width=860,height=550"
                                            )
                                        }
                                        className="view-text"
                                    >
                                        {" "}
                                        View
                                    </a>
                                </p>
                            )}
                            {props.productDetailsData.certificateUrl === "" && (
                                <p>
                                    <strong>Diamond Grading Report</strong>{" "}
                                    <a href="javascript:;" className="view-text">
                                        {" "}
                                        Not Available
                                    </a>
                                </p>
                            )}
                        </div>
                        <div className="diamond-grade">
                            <div className="grade-image">
                                <img
                                    src={props.productDetailsData.certificateIconUrl}
                                    alt="grade-image"
                                ></img>
                            </div>
                            <div className="grade-info">
                                <p>{props.productDetailsData.subHeader}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default DiamondProductGallary;
