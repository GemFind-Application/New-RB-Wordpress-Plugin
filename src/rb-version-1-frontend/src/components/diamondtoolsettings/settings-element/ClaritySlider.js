import React, { useEffect, useState } from "react";
// import Typography from '@material-ui/core/Typography';
import { Modal } from "react-responsive-modal";
import Nouislider from "../../elements/SafeNouislider";
import "nouislider/distribute/nouislider.css";
import Skeleton from "react-loading-skeleton";

const ClaritySlider = (props) => {
  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);
  const [loaded, setLoaded] = useState(false);
  const [loadedfirst, setloadedfirst] = useState(false);

  const marks1 = props.claritySliderData;
  const [getstartClarity, setstartClarity] = useState(
    Number(marks1[0].clarityId)
  );
  const [getendClarity, setendClarity] = useState(
    Number(marks1[marks1.length - 1].clarityId)
  );

  const handleclaritySlider = (e) => {
    props.callBack(e);
    props.defaultClarity(true);
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

  function clarityDiamond(value) {
    var res = props.claritySliderData.filter(function (v) {
      return v.clarityId == value;
    });
    return (res[0] && res[0].clarityName) || ""; // pip id may be absent (single-option facet)
  }

  useEffect(() => {
    const markData = props.claritySliderData;
    if (props.setSelectedClarityData === "") {
      setstartClarity(Number(markData[0].clarityId));
      setendClarity(Number(markData[markData.length - 1].clarityId));
    }
    //if (loadedfirst === false) {
    if (props.setSelectedClarityData !== "") {
      var selectedClarityCookies = props.setSelectedClarityData.split(",");

      var clarityval =
        selectedClarityCookies[selectedClarityCookies.length - 1];

      var res = markData.findIndex(function (v) {
        return v.clarityId == clarityval;
      });
      var finalclarityval = res + 1;
      var clarityvaldata = props.claritySliderData[finalclarityval].clarityId;

      setstartClarity(Number(selectedClarityCookies[0]));
      setendClarity(Number(clarityvaldata));
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
            Clarity
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
              Clarity refers to the tiny natural inclusions — or internal characteristics — found in nearly all diamonds. While flawless diamonds are extremely rare and expensive, most buyers look for stones that appear clean to the naked eye. For many shapes, the sweet spot is typically between VVS2 and SI1, where inclusions are minimal but value is strong.
              </p>
            </div>
          </Modal>
          <div className="diamond-ui-slider">
            {Number(marks1[0].clarityId) === Number(marks1[marks1.length - 1].clarityId) ? (
              // noUiSlider requires min !== max; a single option has nothing to
              // slide, so show it as a static value instead of crashing.
              <span className="single-filter-value">{marks1[0].clarityName}</span>
            ) : (
            <Nouislider
              connect
              behaviour={"none"}
              start={[getstartClarity, getendClarity]}
              cssPrefix={"noUi-"}
              cssClasses={CssClasses}
              pips={{
                mode: "steps",
                stepped: true,
                density: marks1.length + 1,
                format: {
                  to: function (value) {
                    return clarityDiamond(value);
                  },
                },
              }}
              clickablePips
              step={1}
              range={{
                min: Number(marks1[0].clarityId),
                max: Number(marks1[marks1.length - 1].clarityId),
              }}
              onSet={handleclaritySlider}
            />
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default ClaritySlider;
