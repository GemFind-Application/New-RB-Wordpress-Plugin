import React, { useEffect, useState } from "react";
// import Typography from '@material-ui/core/Typography';
import { Modal } from "react-responsive-modal";
import Nouislider from "../../elements/SafeNouislider";
import "nouislider/distribute/nouislider.css";
const Fancyintensity = (props) => {
    const [open, setOpen] = useState(false);
    const [loadedfirst, setloadedfirst] = useState(false);
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const [loaded, setLoaded] = useState(false);
    const marks1 = props.getIntensityData;
    const [getstartColor, setstartColor] = useState(
        Number(marks1[0].intensityId)
    );
    const [getendColor, setendColor] = useState(
        Number(marks1[marks1.length - 1].intensityId)
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
        var res = props.getIntensityData.filter(function (v) {
            return v.intensityId == value;
        });
        return (res[0] && res[0].intensityName) || ""; // pip id may be absent (single-option facet)
    }

    const handlecolorSlider = (e) => {
        props.callBack(e);
    };

    useEffect(() => {
        const markData = props.getIntensityData;
       
        if (props.setSelectedIntensityData !== "") {
            var selectedIntensityCookies =
                props.setSelectedIntensityData.split(",");
            var intensityval =
                selectedIntensityCookies[selectedIntensityCookies.length - 1];

            if (intensityval == "Last") {
                var intensityval =
                    selectedIntensityCookies[
                        selectedIntensityCookies.length - 2
                    ];
            }

            var res = markData.findIndex(function (v) {
                return v.intensityName == intensityval;
            });
            var finalintensityval = res + 1;

            var intensityvaldata =
                props.getIntensityData[finalintensityval].intensityName;

            var firstval = markData.filter(function (v) {
                return v.intensityName == selectedIntensityCookies[0];
            });

            var lastval = markData.filter(function (v) {
                return v.intensityName == intensityvaldata;
            });
            setstartColor(Number(firstval[0].intensityId));
            setendColor(Number(lastval[0].intensityId));
        }

        setLoaded(true);
    }, []);

    const showFilterInfo = Number(window.initData?.data?.[0]?.show_filter_info) === 1 || window.initData?.data?.[0]?.show_filter_info === true;

    return (
        <div className="range-slider_diamond">
            <div className="slider">
                <h4 className="f_heading diamond_heading  dia_heading">
                    FANCY INTENSITY
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
                            The main color, and if there is a secondary color,
                            together define the color tone, however the strength
                            of color is defined by the intensity level. The
                            intensity level can be anywhere from a very soft
                            shade to a very strong shade, and the stronger the
                            shade the more valuable the diamond.
                        </p>
                    </div>
                </Modal>
                <div className="diamond-ui-slider">
                    <Nouislider
                        connect
                        behaviour={"none"}
                        start={[getstartColor, getendColor]}
                        cssPrefix={"noUi-"}
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
                        // range={{
                        //   min: [getstartColor],
                        //   max: [getendColor],
                        // }}
                        range={{
                            min: Number(marks1[0].intensityId),
                            max: Number(marks1[marks1.length - 1].intensityId),
                        }}
                        onSet={handlecolorSlider}
                    />
                </div>
            </div>
        </div>
    );
};

export default Fancyintensity;
