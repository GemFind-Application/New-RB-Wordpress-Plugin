import React, { useEffect, useState } from "react";
import { Modal } from "react-responsive-modal";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import Skeleton from "react-loading-skeleton";
import { useCookies } from "react-cookie";

const TableSlider = (props) => {
  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);
  const [loaded, setLoaded] = useState(false);
  const marks = props.tableSliderData;
  const [startValue, setstartValue] = useState(props.tablemin);
  const [lastValue, setlastValue] = useState(props.tablemax);
  const [getfancycookies, setfancycookies] = useCookies([
    "_wpsavedfancydiamondfiltercookie",
  ]);

  // Changing State when volume increases/decreases
  const rangeSelector = (newValue) => {
    setstartValue(Number(newValue[0]));
    setlastValue(Number(newValue[1]));
    //props.callBack(newValue);
  };
  const rangeSelectorprops = (newValue) => {
    setstartValue(Number(newValue[0]));
    setlastValue(Number(newValue[1]));
    props.callBack(newValue);
  };

  const startValueOnChange = (event) => {
    const intValue = parseInt(event.target.value);
    if (Number.isInteger(intValue) && intValue >= 0 && intValue <= 100) {
      setstartValue(event.target.value);
      let sliderSelection = [];
      sliderSelection.push(parseInt(event.target.value));
      sliderSelection.push(lastValue);
      props.callBack(sliderSelection);
    } else {
      alert("Please Enter Valid Value");
      return;
    }
  };

  const endValueOnChange = (event) => {
    const intValue = parseInt(event.target.value);
    if (Number.isInteger(intValue) && intValue >= 0 && intValue <= 100) {
      setlastValue(event.target.value);
      let sliderSelection = [];
      sliderSelection.push(startValue);
      sliderSelection.push(event.target.value);
      props.callBack(sliderSelection);
    } else {
      alert("Please Enter Valid Value");
      return;
    }
  };

  useEffect(() => {
    setLoaded(true);
    
    if (props.tablemin === "" && props.tablemax === "") {
      setstartValue(Number(props.tableSliderData[0].minTable));
      setlastValue(Number(props.tableSliderData[0].maxTable));
    }
  }, [props.tablemin, props.tablemax, props.tableSliderData]);

  if (loaded === false) {
    return <Skeleton height={80} />;
  } else {
    const showFilterInfo = Number(window.initData?.data?.[0]?.show_filter_info) === 1 || window.initData?.data?.[0]?.show_filter_info === true;

    return (
      <div className="range-slider_diamond">
        <div className="slider">
         
          <h4 className="f_heading">
            Table
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
                Table percentage is the width of a diamond’s largest facet the
                table divided by its overall width. It tells you how big the
                “face” of a diamond is.
              </p>
            </div>
          </Modal>

          <div className="diamond-ui-slider diamond-small-slider">
            <Nouislider
              connect
              behaviour={"tap"}
              start={[startValue, lastValue]}
              step={1}
              range={{
                min: Number(marks[0].minTable),
                max: Number(marks[0].maxTable),
              }}
              //onUpdate={rangeSelector}
              onChange={rangeSelectorprops}
            />
          </div>
        </div>
        <div className="input-value-pr">
          <div className="input-value-left">
            <input
              type="text"
              value={startValue}
              onChange={startValueOnChange}
              className="input-left"
            />
            <span className="icon">%</span>
          </div>
          <div className="input-value-right">
            <input
              type="text"
              value={lastValue}
              onChange={endValueOnChange}
              className="input-left"
            />
            <span className="icon">%</span>
          </div>
        </div>
      </div>
    );
  }
};

export default TableSlider;
