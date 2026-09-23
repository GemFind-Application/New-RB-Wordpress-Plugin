import React, { useEffect, useState } from "react";
import { Modal } from "react-responsive-modal";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import Skeleton from "react-loading-skeleton";

const DepthSlider = (props) => {
  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);
  const [loaded, setLoaded] = useState(false);
  const marks = props.depthSliderData;
  const [startValue, setstartValue] = useState(Number(props.depthmin));
  const [lastValue, setlastValue] = useState(Number(props.depthmax));

  // Changing State when volume increases/decreases
  const rangeSelector = (newValue) => {
    setstartValue(Number(newValue[0]));
    setlastValue(Number(newValue[1]));

    let sliderSelection = [];
    sliderSelection.push(Number(newValue[0]));
    sliderSelection.push(Number(newValue[1]));
    // props.callBack(newValue);
  };

  const rangeSelectorprops = (newValue) => {
    setstartValue(Number(newValue[0]));
    setlastValue(Number(newValue[1]));

    let sliderSelection = [];
    sliderSelection.push(Number(newValue[0]));
    sliderSelection.push(Number(newValue[1]));
    //props.callBack(newValue);
    props.callBack(sliderSelection);
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

    if (props.depthmin === "" && props.depthmax === "") {
      setstartValue(Number(props.depthSliderData[0].minDepth));
      setlastValue(Number(props.depthSliderData[0].maxDepth));
    }
  }, [props.depthmin, props.depthmax, props.depthSliderData]);

  if (loaded === false) {
    return <Skeleton height={80} />;
  } else {
    const showFilterInfo = Number(window.initData?.data?.[0]?.show_filter_info) === 1 || window.initData?.data?.[0]?.show_filter_info === true;

    return (
      <div className="range-slider_diamond">
        <div className="slider">
          {/* <Typography id="range-slider" className='f_heading' gutterBottom>
        Price
      </Typography> */}
          <h4 className="f_heading diamond_heading">
            Depth
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
                Depth percentage is the height of the diamond measured from the
                culet to the table, divided by the width of the diamond. The
                lower the depth %, the larger the diamond will appear (given the
                same weight), but if this number is too low then the brilliance
                of the diamond will be sacrificed. The depth percentage is one
                of the elements that determines the Cut grading.
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
                min: Number(marks[0].minDepth),
                max: Number(marks[0].maxDepth),
              }}
              //onUpdate={rangeSelector}
              onChange={rangeSelectorprops}
            />
          </div>
        </div>
        <div className="input-value-pr dia-input-value">
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

export default DepthSlider;
