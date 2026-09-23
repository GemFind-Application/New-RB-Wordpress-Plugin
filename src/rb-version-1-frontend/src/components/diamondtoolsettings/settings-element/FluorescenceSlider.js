import React, { useEffect, useState } from "react";
import { Modal } from "react-responsive-modal";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import Skeleton from "react-loading-skeleton";

const FluorescenceSlider = (props) => {
  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);
  const [loaded, setLoaded] = useState(false);
  const marks = props.fluorescenceSliderData;
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
    var res = props.fluorescenceSliderData.filter(function (v) {
      return v.fluorescenceId == value;
    });
    return (res[0] && res[0].fluorescenceName) || ""; // pip id may be absent (single-option facet)
  }

  useEffect(() => {
    const markData = props.fluorescenceSliderData;
    setstartCut(Number(markData[0].fluorescenceId));
    setendCut(Number(markData[markData.length - 1].fluorescenceId));

    if (props.setSelectedFluoreData !== "") {
      var selectedFluoreCookies = props.setSelectedFluoreData.split(",");
      var floureval = selectedFluoreCookies[selectedFluoreCookies.length - 1];
      var res = markData.findIndex(function (v) {
        return v.fluorescenceId == floureval;
      });
      var finalfloureval = res + 1;
      var flourevaldata =
        props.fluorescenceSliderData[finalfloureval].fluorescenceId;

      setstartCut(Number(selectedFluoreCookies[0]));
      setendCut(Number(flourevaldata));
      setloadedfirst(true);
    }

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
            Fluorescence
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
                Fluorescence tells you how a diamond responds to ultraviolet
                light - does it glow under a black light? Diamonds with no
                fluorescence are generally priced higher on the market, but it
                is rare for fluorescence to have any visual impact on the
                diamond; some fluorescence can even enhance the look of the
                stone. Our site recommends searching for diamonds with none to
                medium fluorescence, and keeping open the option of strong
                fluorescence for additional value.
              </p>
            </div>
          </Modal>
          <div className="diamond-ui-slider">
            {Number(marks[0].fluorescenceId) === Number(marks[marks.length - 1].fluorescenceId) ? (
              // noUiSlider requires min !== max; a single option has nothing to
              // slide, so show it as a static value instead of crashing.
              <span className="single-filter-value">{marks[0].fluorescenceName}</span>
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
                min: Number(marks[0].fluorescenceId),
                max: Number(marks[marks.length - 1].fluorescenceId),
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

export default FluorescenceSlider;
