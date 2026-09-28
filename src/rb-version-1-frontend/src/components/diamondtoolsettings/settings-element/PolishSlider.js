import React, { useEffect, useState } from "react";
import { Modal } from "react-responsive-modal";
import Nouislider from "../../elements/SafeNouislider";
import "nouislider/distribute/nouislider.css";
import Skeleton from "react-loading-skeleton";

const PolishSlider = (props) => {
  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);
  const [loaded, setLoaded] = useState(false);
  const marks = props.polishSliderData;
  const [getstartCut, setstartCut] = useState(0);
  const [getendCut, setendCut] = useState(0);
  const [loadedfirst, setloadedfirst] = useState(false);

  const handlecutSlider = (e) => {
    props.callBack(e);
    props.defaultCut(true);
  };
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

  function cutDiamond(value) {
    var res = props.polishSliderData.filter(function (v) {
      return v.polishId == value;
    });
    return (res[0] && res[0].polishName) || ""; // pip id may be absent (single-option facet)
  }

  useEffect(() => {
    const markData = props.polishSliderData;
    setstartCut(Number(markData[0].polishId));
    setendCut(Number(markData[markData.length - 1].polishId));

    //if (loadedfirst === false) {
    if (props.setSelectedPolishData !== "") {
      var selectedPolishCookies = props.setSelectedPolishData.split(",");
      var polishval = selectedPolishCookies[selectedPolishCookies.length - 1];
      var res = markData.findIndex(function (v) {
        return v.polishId == polishval;
      });
      var finalpolishval = res + 1;
      var polishvaldata = props.polishSliderData[finalpolishval].polishId;
      setstartCut(Number(selectedPolishCookies[0]));
      setendCut(Number(polishvaldata));
      setloadedfirst(true);
    }
    //}
    setLoaded(true);
  }, [props]);

  if (loaded === false) {
    return <Skeleton height={80} />;
  } else {
    const showFilterInfo = Number(window.initData?.data?.[0]?.show_filter_info) === 1 || window.initData?.data?.[0]?.show_filter_info === true;

    return (
      <div className="range-slider_diamond">
        <div className="slider">
          <h4 className="f_heading diamond_heading dia_heading">
            Polish
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
                Polish describes how smooth the surface of a diamond is. Aim for
                an Excellent or Very Good polish rating.
              </p>
            </div>
          </Modal>
          <div className="diamond-ui-slider">
            {Number(marks[0].polishId) === Number(marks[marks.length - 1].polishId) ? (
              // noUiSlider requires min !== max; a single option has nothing to
              // slide, so show it as a static value instead of crashing.
              <span className="single-filter-value">{marks[0].polishName}</span>
            ) : (
            <Nouislider
              connect
              behaviour={"none"}
              start={[getstartCut, getendCut]}
              cssPrefix={"noUi-"}
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
                min: Number(marks[0].polishId),
                max: Number(marks[marks.length - 1].polishId),
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

export default PolishSlider;
