import React, { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
import ImageLoader from "react-load-image";
import { Modal } from "react-responsive-modal";
import spinnerGif from '../../../images/spinner.gif';

const CompleteRingGallary = (props) => {
    const [getVideo, setVideo] = useState(true);
    const [getImage, setImage] = useState(false);
    const [getDefaultImage, setDefaultImage] = useState("");
    const [selectedImage, setselectedImage] = useState("");
    const [open, setOpen] = useState(false);
    const onCloseModal = () => setOpen(false);

    const [openVideo, setOpenVideo] = useState(false);

    const onOpenModalVideo = () => setOpenVideo(true);
    const onCloseModalVideo = () => {
        setOpenVideo(false);
    };

    const onOpenVideo = (e) => {
        e.preventDefault();
        setVideo(true);
        setImage(false);
    };

    const changeimage = (e) => {
        e.preventDefault();
        setselectedImage(e.target.id);
        setDefaultImage(e.target.src);
        setVideo(false);
        setImage(true);
    };

    const onOpenimage = (e) => {
        e.preventDefault();
        setOpen(true);
    };

    useEffect(() => {
        if (props.productDetailsData.videoURL) {
            setVideo(true);
            setImage(false);
        } else {
            setVideo(false);
            setImage(true);
        }
        setDefaultImage(props.productDetailsData.mainImageURL);
    }, []);
    var imagesGallery = [];
    if (props.productDetailsData.extraImage) {
        props.productDetailsData.extraImage.map((val) =>
            imagesGallery.push({ original: val, thumbnail: val })
        );
    }
    if (props.productDetailsData.mainImageURL) {
        imagesGallery.push({
            original: props.productDetailsData.mainImageURL,
            thumbnail: props.productDetailsData.mainImageURL,
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
        <div className="product-image-gallary">
            <div className="top-icons">
                <span className="zoom-icon" onClick={onOpenimage}>
                    <i className="fas fa-search-plus"></i>
                </span>
                <span
                    className={`video-icon ${
                        props.productDetailsData.videoURL === ""
                            ? "disable"
                            : ""
                    }`}
                    onClick={onOpenModalVideo}
                >
                    <i className="fas fa-video"></i>
                </span>
                <Modal open={openVideo} onClose={onCloseModalVideo} center>
                    <div className={`ring-diamond-video active`}>
                        <video
                            width="100%"
                            autoPlay={true}
                            loop={true}
                            muted={true}
                            playsInline={true}
                            draggable="true"
                        >
                            <source
                                src={props.productDetailsData.videoURL}
                                type="video/mp4"
                            />
                        </video>
                    </div>
                </Modal>
            </div>
            <Modal
                open={open}
                onClose={onCloseModal}
                center
                classNames={{
                    overlay: "popup_Overlay",
                    modal: "popup_product",
                }}
            >
                <div className="popup_image">
                    <ImageLoader src={getDefaultImage}>
                        <img alt="product-gallery" />
                        <div>Error!</div>
                        <div className="image_loaader">
                            {" "}
                            <PreloaderImage />{" "}
                        </div>
                    </ImageLoader>
                </div>
            </Modal>
            {/* <div
        className={`ring-diamond-video ${getVideo === true ? "active" : ""} `}
      >
        <video
          width="100%"
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline={true}
          draggable="true"
        >
          <source src={props.productDetailsData.videoURL} type="video/mp4" />
        </video>
      </div> */}
            <div className={`ring-diamond-image active`}>
                <ImageLoader src={getDefaultImage}>
                    <img alt="product-gallery" />
                    <div>Error!</div>
                    <div className="image_loaader">
                        {" "}
                        <PreloaderImage />{" "}
                    </div>
                </ImageLoader>
            </div>
            {props.productDetailsData.styleNumber !== "NA" && (
                <div className="product-skus">
                    <h2>SKU# {props.productDetailsData.styleNumber}</h2>
                </div>
            )}
            <div className={`thumbnailimage image-thumb-image`}>
                <ul className="image-gallary-box completering-image-scroll">
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
                            <ImageLoader src={val.original}>
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
        </div>
    );
};

export default CompleteRingGallary;
