import React, { useEffect, useState } from "react";
import { Modal } from "react-responsive-modal";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import Skeleton from "react-loading-skeleton";
import useDebouncedCallback from "../../../utils/useDebouncedCallback";
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
    commitTypedRange.cancel();
    setstartValue(Number(newValue[0]));
    setlastValue(Number(newValue[1]));
    props.callBack(newValue);
  };

  // Typed values are only sent once the user pauses, so "20" doesn't trigger a search at "2".
  const commitTypedRange = useDebouncedCallback(() => {
    if (startValue === "" || lastValue === "") {
      return;
    }
    const start = Number(startValue);
    const end = Number(lastValue);
    if (!(start >= 0 && start <= 100 && end >= 0 && end <= 100)) {
      alert("Please Enter Valid Value");
      return;
    }
    props.callBack([start, end]);
  });

  const isNumericInput = (value) => /^\d*\.?\d*$/.test(value);

  const startValueOnChange = (event) => {
    const value = event.target.value;
    if (!isNumericInput(value)) {
      return;
    }
    setstartValue(value);
    commitTypedRange();
  };

  const endValueOnChange = (event) => {
    const value = event.target.value;
    if (!isNumericInput(value)) {
      return;
    }
    setlastValue(value);
    commitTypedRange();
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
              onBlur={commitTypedRange.flush}
              className="input-left"
            />
            <span className="icon">%</span>
          </div>
          <div className="input-value-right">
            <input
              type="text"
              value={lastValue}
              onChange={endValueOnChange}
              onBlur={commitTypedRange.flush}
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
