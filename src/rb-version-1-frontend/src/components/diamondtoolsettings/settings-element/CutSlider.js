import React, { useEffect, useState } from "react";
import { Modal } from "react-responsive-modal";
import Nouislider from "../../elements/SafeNouislider";
import "nouislider/distribute/nouislider.css";
import Skeleton from "react-loading-skeleton";

const CutSlider = (props) => {
    const [open, setOpen] = useState(false);
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const [loaded, setLoaded] = useState(false);
    const marks = props.cutSliderData;
    const [getstartCut, setstartCut] = useState(0);
    const [getendCut, setendCut] = useState(0);
    const [getstartvalueCut, setstartvalueCut] = useState(0);
    const [getendvalueCut, setendvalueCut] = useState(0);
    const [loadedfirst, setloadedfirst] = useState(false);

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

    const handlecutSlider = (e) => {
        props.callBack(e);
        props.defaultCut(true);
    };

    function cutDiamond(value) {
        var res = props.cutSliderData.filter(function (v) {
            return v.cutId == value;
        });
        return (res[0] && res[0].cutName) || ""; // pip id may be absent (single-option facet)
    }

    useEffect(() => {
        const markData = props.cutSliderData;
        setstartCut(Number(markData[0].cutId));
        setendCut(Number(markData[markData.length - 1].cutId));

        //if (loadedfirst === false) {
        if (props.setSelectedCutData !== "") {
            var selectedCutCokkies = props.setSelectedCutData.split(",");
            var cutval = selectedCutCokkies[selectedCutCokkies.length - 1];
            var res = markData.findIndex(function (v) {
                return v.cutId == cutval;
            });
            var finalcutval = res + 1;
            var cutvaldata = props.cutSliderData[finalcutval].cutId;
            setstartCut(Number(selectedCutCokkies[0]));
            setendCut(Number(cutvaldata));
            setloadedfirst(true);
        }
        // }
        setLoaded(true);
    }, [props]);

    if (loaded === false) {
        return <Skeleton height={80} />;
    } else {
        const showFilterInfo = Number(window.initData?.data?.[0]?.show_filter_info) === 1 || window.initData?.data?.[0]?.show_filter_info === true;

        return (
            <div className="range-slider_diamond">
                <div className="slider">
                    <h4 className="f_heading dia_heading diamond_heading">
                        CUT
                        {showFilterInfo && (
                            <span className="f_popup" onClick={onOpenModal}>
                                <i className="fas fa-info-circle"> </i>
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
                                Not to be confused with shape, a diamond' s cut
                                rating tells you how well its proportions
                                interact with light.By evaluating the angles and
                                proportions of the diamond, the cut grade is
                                designed to tell you how sparkly and brilliant
                                your stone is.Cut grading is usually not
                                available for fancy shapes(any shape that is not
                                round), because the mathematical formula that
                                determines light return becomes less reliable
                                when different length to width ratios are
                                factored in .
                            </p>
                        </div>
                    </Modal>
                    <div className="diamond-ui-slider">
                        {Number(marks[0].cutId) === Number(marks[marks.length - 1].cutId) ? (
                            // noUiSlider requires min !== max; a single option has nothing
                            // to slide, so show it as a static value instead of crashing.
                            <span className="single-filter-value">{marks[0].cutName}</span>
                        ) : (
                        <Nouislider
                            connect
                            behaviour={"none"}
                            start={[getstartCut, getendCut]}
                            cssClasses={CssClasses}
                            pips={{
                                mode: "steps",
                                stepped: true,
                                density: marks.length + 1,
                                format: {
                                    to: function (value) {
                                        return cutDiamond(value);
                                    },
                                },
                            }}
                            clickablePips
                            step={1}
                            range={{
                                min: Number(marks[0].cutId),
                                max: Number(marks[marks.length - 1].cutId),
                            }}
                            onSet={handlecutSlider}
                        />
                        )}
                    </div>
                </div>
            </div>
        );
    }
};

export default CutSlider;
