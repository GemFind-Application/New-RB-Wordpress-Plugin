import React, { useEffect, useState } from "react";
import { Modal } from "react-responsive-modal";
import Nouislider from "../../elements/SafeNouislider";
import "nouislider/distribute/nouislider.css";
import Skeleton from "react-loading-skeleton";
import colorJpg from '../../../images/color.jpg';

const FancyColorSlider = (props) => {
    const [open, setOpen] = useState(false);
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const marks1 = props.fancycolorSliderData;
    const [loaded, setLoaded] = useState(false);
    const [loadedfirst, setloadedfirst] = useState(false);
    const [getstartColor, setstartColor] = useState(Number(marks1[0].id));
    const [getendColor, setendColor] = useState(
        Number(marks1[marks1.length - 1].id)
    );
    const CssClasses = {
        target: "target",
        base: "base",
        origin: "origin",
        handle: "handle",
        handleLower: "handle-lower",
        handleUpper: "handle-upper",
        touchArea: "touch-area",
        horizontal: "horizontal",
        vertical: "vertical",
        background: "background",
        connect: "connect",
        connects: "connects",
        ltr: "ltr",
        rtl: "rtl",
        textDirectionLtr: "txt-dir-ltr",
        textDirectionRtl: "txt-dir-rtl",
        draggable: "draggable",
        drag: "state-drag",
        tap: "state-tap",
        active: "active",
        tooltip: "tooltip",
        pips: "pips",
        pipsHorizontal: "pips-horizontal",
        pipsVertical: "pips-vertical",
        marker: "marker",
        markerHorizontal: "marker-horizontal",
        markerVertical: "marker-vertical",
        markerNormal: "marker-normal",
        markerLarge: "marker-sub",
        markerSub: "marker-sub",
        value: "value",
        valueHorizontal: "value-horizontal",
        valueVertical: "value-vertical",
        valueNormal: "value-normal",
        valueLarge: "value-sub",
        valueSub: "value-sub",
    };

    function colorDiamond(value) {
        var res = props.fancycolorSliderData.filter(function (v) {
            return v.id == value;
        });
        return res[0]?.diamondColorName;
    }

    const handlecolorSlider = (e) => {
        props.callBack(e);
    };

    useEffect(() => {
        const markData = props.fancycolorSliderData;

        if (props.setSelectedFancyColorData !== "") {
            var selectedColorCookies =
                props.setSelectedFancyColorData.split(",");

            var colorval =
                selectedColorCookies[selectedColorCookies.length - 1];
            if (colorval == "Last") {
                var colorval =
                    selectedColorCookies[selectedColorCookies.length - 2];
            }

            var res = markData.findIndex(function (v) {
                return v.diamondColorId == colorval;
            });

            var finalcolorval = res + 1;

            var colorvaldata =
                props.fancycolorSliderData[finalcolorval].diamondColorId;

            var firstval = markData.filter(function (v) {
                return v.diamondColorId == selectedColorCookies[0];
            });

            var lastval = markData.filter(function (v) {
                return v.diamondColorId == colorvaldata;
            });

        setstartColor(Number(firstval[0].id));
            setendColor(Number(lastval[0].id));
        }

        setLoaded(true);
    }, []);

    if (loaded === false) {
        return <Skeleton height={80} />;
    } else {
        const showFilterInfo = Number(window.initData?.data?.[0]?.show_filter_info) === 1 || window.initData?.data?.[0]?.show_filter_info === true;

        return (
            <div className="range-slider_diamond">
                <div className="slider">
                    <h4 className="f_heading diamond_heading dia_heading">
                        Color
                        {showFilterInfo && (
                            <span className="f_popup" onClick={onOpenModal}>
                                <i className="fas fa-info-circle"></i>
                            </span>
                        )}
                    </h4>
                    <Modal
                        open={open}
                        onClose={onCloseModal}
                        center
                        classNames={{
                            overlay: "popup_Overlay",
                            modal: "popup_Modal gf-rb-v1-filter-modal",
                        }}
                    >
                        <div className="gf-rb-v1-filter-popup">
                            <p className="gf-rb-v1-filter-popup__text">
                                The color scale measures the degree of
                                colorlessness in a diamond. D is the highest and
                                most colorless grade, but also the most
                                expensive. To get the most value for your
                                budget, look for an eye colorless stone. For
                                most diamonds, this is in the F-H range.
                            </p>
                            <img
                                src={
                                    colorJpg
                                }
                                alt="Color"
                                className="popup-image"
                            ></img>
                        </div>
                    </Modal>
                    <div className="diamond-ui-slider">
                        <Nouislider
                            connect
                            behaviour={"none"}
                            start={[getstartColor, getendColor]}
                            cssClasses={CssClasses}
                            pips={{
                                mode: "steps",
                                stepped: true,
                                density: marks1.length + 1,
                                format: {
                                    to: function (value) {
                                        return colorDiamond(value);
                                    },
                                },
                            }}
                            clickablePips
                            step={1}
                            range={{
                                min: Number(marks1[0].id),
                                max: Number(marks1[marks1.length - 1].id),
                            }}
                            // onSlide={handlecolorSlider}
                            // onUpdate={handlecolorSlider}
                            onSet={handlecolorSlider}
                        />
                    </div>
                </div>
            </div>
        );
    }
};

export default FancyColorSlider;
