import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-responsive-modal";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import Skeleton from "react-loading-skeleton";

const PriceSlider = (props) => {
  // Our States

  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);
  const [loaded, setLoaded] = useState(false);
  const marks = props.pricerangeData;
  const [startPrice, setstartPrice] = useState(Number(props.pricemindata));
  const [lastPrice, setlastPrice] = useState(Number(props.pricemaxdata));
  // Store raw input values to allow free typing
  const [startInputValue, setStartInputValue] = useState(String(props.pricemindata || ""));
  const [lastInputValue, setLastInputValue] = useState(String(props.pricemaxdata || ""));
  // Refs for debounce timeouts
  const startDebounceRef = useRef(null);
  const endDebounceRef = useRef(null);

  const formatToTwoDecimals = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    return num.toFixed(2);
  };

  const rangeSelectorprops = (newValue) => {
    const startVal = parseFloat(newValue[0]);
    const lastVal = parseFloat(newValue[1]);
    
    setstartPrice(startVal);
    setlastPrice(lastVal);
    setStartInputValue(formatToTwoDecimals(startVal));
    setLastInputValue(formatToTwoDecimals(lastVal));

    let sliderSelection = [];
    sliderSelection.push(startVal);
    sliderSelection.push(lastVal);
    props.callBack(sliderSelection);
  };
  const validateAndUpdateStartValue = (value) => {
    // Allow empty string while typing
    if (value === "") {
      setStartInputValue("");
      // Clear any pending debounce
      if (startDebounceRef.current) {
        clearTimeout(startDebounceRef.current);
      }
      return;
    }

    // Remove any non-numeric characters except decimal point
    let cleanedValue = value.replace(/[^0-9.]/g, "");
    
    // Prevent multiple decimal points
    const parts = cleanedValue.split(".");
    if (parts.length > 2) {
      cleanedValue = parts[0] + "." + parts.slice(1).join("");
    }
    
    // Update input value immediately
    setStartInputValue(cleanedValue);
    
    // Clear previous debounce
    if (startDebounceRef.current) {
      clearTimeout(startDebounceRef.current);
    }
    
    // Debounce the callback - apply after user stops typing (500ms)
    startDebounceRef.current = setTimeout(() => {
      const numValue = parseFloat(cleanedValue);
      if (!isNaN(numValue)) {
        const minPrice = Number(marks[0].minPrice);
        const maxPrice = Number(marks[0].maxPrice);
        
        if (numValue >= minPrice && numValue <= maxPrice) {
          setstartPrice(numValue);
          setStartInputValue(formatToTwoDecimals(numValue));
          let sliderSelection = [];
          sliderSelection.push(numValue);
          sliderSelection.push(Number(lastPrice));
          props.callBack(sliderSelection);
        }
      }
    }, 500);
  };

  const validateAndUpdateEndValue = (value) => {
    // Allow empty string while typing
    if (value === "") {
      setLastInputValue("");
      // Clear any pending debounce
      if (endDebounceRef.current) {
        clearTimeout(endDebounceRef.current);
      }
      return;
    }

    // Remove any non-numeric characters except decimal point
    let cleanedValue = value.replace(/[^0-9.]/g, "");
    
    // Prevent multiple decimal points
    const parts = cleanedValue.split(".");
    if (parts.length > 2) {
      cleanedValue = parts[0] + "." + parts.slice(1).join("");
    }
    
    // Update input value immediately
    setLastInputValue(cleanedValue);
    
    // Clear previous debounce
    if (endDebounceRef.current) {
      clearTimeout(endDebounceRef.current);
    }
    
    // Debounce the callback - apply after user stops typing (500ms)
    endDebounceRef.current = setTimeout(() => {
      const numValue = parseFloat(cleanedValue);
      if (!isNaN(numValue)) {
        const minPrice = Number(marks[0].minPrice);
        const maxPrice = Number(marks[0].maxPrice);
        
        if (numValue >= minPrice && numValue <= maxPrice) {
          setlastPrice(numValue);
          setLastInputValue(formatToTwoDecimals(numValue));
          let sliderSelection = [];
          sliderSelection.push(Number(startPrice));
          sliderSelection.push(numValue);
          props.callBack(sliderSelection);
        }
      }
    }, 500);
  };

  const startPriceOnChange = (event) => {
    validateAndUpdateStartValue(event.target.value);
  };

  const startPriceOnBlur = (event) => {
    // Clear any pending debounce since we're applying immediately
    if (startDebounceRef.current) {
      clearTimeout(startDebounceRef.current);
      startDebounceRef.current = null;
    }
    
    const value = event.target.value;
    if (value === "") {
      // If empty, reset to current startPrice
      setStartInputValue(formatToTwoDecimals(startPrice));
      return;
    }

    const numValue = parseFloat(value);
    const minPrice = Number(marks[0].minPrice);
    const maxPrice = Number(marks[0].maxPrice);

    if (isNaN(numValue) || numValue < minPrice || numValue > maxPrice) {
      alert(`Please Enter Valid Value between ${minPrice} and ${maxPrice}`);
      setStartInputValue(formatToTwoDecimals(startPrice));
    } else {
      // Use the actual float value, not integer
      setstartPrice(numValue);
      setStartInputValue(formatToTwoDecimals(numValue));
      let sliderSelection = [];
      sliderSelection.push(numValue);
      sliderSelection.push(Number(lastPrice));
      props.callBack(sliderSelection);
    }
  };

  const endValueOnChange = (event) => {
    validateAndUpdateEndValue(event.target.value);
  };

  const endValueOnBlur = (event) => {
    // Clear any pending debounce since we're applying immediately
    if (endDebounceRef.current) {
      clearTimeout(endDebounceRef.current);
      endDebounceRef.current = null;
    }
    
    const value = event.target.value;
    if (value === "") {
      // If empty, reset to current lastPrice
      setLastInputValue(formatToTwoDecimals(lastPrice));
      return;
    }

    const numValue = parseFloat(value);
    const minPrice = Number(marks[0].minPrice);
    const maxPrice = Number(marks[0].maxPrice);

    if (isNaN(numValue) || numValue < minPrice || numValue > maxPrice) {
      alert(`Please Enter Valid Value between ${minPrice} and ${maxPrice}`);
      setLastInputValue(formatToTwoDecimals(lastPrice));
    } else {
      // Use the actual float value, not integer
      setlastPrice(numValue);
      setLastInputValue(formatToTwoDecimals(numValue));
      let sliderSelection = [];
      sliderSelection.push(Number(startPrice));
      sliderSelection.push(numValue);
      props.callBack(sliderSelection);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.target.blur(); // Trigger blur validation
    }
  };

  useEffect(() => {
    setLoaded(true);
    let newStartValue = startPrice;
    let newLastValue = lastPrice;

    if (props.pricemindata === "" && props.pricemaxdata === "") {
      newStartValue = Number(marks[0].minPrice);
      newLastValue = Number(marks[0].maxPrice);
    } else {
      newStartValue = Number(props.pricemindata);
      newLastValue = Number(props.pricemaxdata);
    }

    setstartPrice(newStartValue);
    setlastPrice(newLastValue);
    setStartInputValue(formatToTwoDecimals(newStartValue));
    setLastInputValue(formatToTwoDecimals(newLastValue));
    
    // Cleanup debounce timers on unmount or props change
    return () => {
      if (startDebounceRef.current) {
        clearTimeout(startDebounceRef.current);
      }
      if (endDebounceRef.current) {
        clearTimeout(endDebounceRef.current);
      }
    };
  }, [props]);

  if (loaded === false) {
    return <Skeleton height={80} />;
  } else {
    return (
      <>
        <style>
          {`.range-slider_diamond .noUi-connect{
            background: ${window.initData["data"][0].slider_colour};
          }`}
        </style>
      <div className="range-slider_diamond">
        <div className="slider">
          <h4 className="f_heading">
            Price
            {(Number(window.initData?.data?.[0]?.show_filter_info) === 1 || window.initData?.data?.[0]?.show_filter_info === true) && (
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
                This refer to different type of Price to filter and select the
                appropriate ring as per your requirements. Look for best suit
                price of your chosen ring.
              </p>
            </div>
          </Modal>
          <div className="diamond-ui-slider diamond-small-slider">
            <Nouislider
              connect={true}
              behaviour={"snap"}
              start={[startPrice, lastPrice]}
              range={{
                min: Number(marks[0].minPrice),
                max: Number(marks[0].maxPrice),
              }}
              step={0.01}
              tooltips={true}
              onChange={rangeSelectorprops}
            />
          </div>
        </div>
        <div className="input-value">
          <div className="input-value-left">
            <span className={(() => {
              const priceRowFormat = window.initData["data"][0].price_row_format;
              return (priceRowFormat === '1' || priceRowFormat === "right") ? "icon-right" : "icon-left";
            })()}>
              {window.currencyFrom === 'USD' 
                ? window.currency
                : window.currencyFrom + " " + window.currency
              }
            </span>
            <input
              className={(() => {
                const priceRowFormat = window.initData["data"][0].price_row_format;
                return (priceRowFormat === '1' || priceRowFormat === "right") ? "input-left" : "";
              })()}
              type="text"
              value={startInputValue}
              onChange={startPriceOnChange}
              onBlur={startPriceOnBlur}
              onKeyPress={handleKeyPress}
            />{" "}
          </div>
          <div className="input-value-right">
            <span className={(() => {
              const priceRowFormat = window.initData["data"][0].price_row_format;
              return (priceRowFormat === '1' || priceRowFormat === "right") ? "icon-right" : "icon-left";
            })()}>
              {window.currencyFrom === 'USD' 
                ? window.currency
                : window.currencyFrom + " " + window.currency
              }
            </span>
            <input 
              type="text" 
              value={lastInputValue} 
              onChange={endValueOnChange} 
              onBlur={endValueOnBlur}
              onKeyPress={handleKeyPress}
              className={(() => {
                const priceRowFormat = window.initData["data"][0].price_row_format;
                return (priceRowFormat === '1' || priceRowFormat === "right") ? "input-left" : "";
              })()} 
            />
          </div>
        </div>
      </div>
      </>
    );
  }
};

export default PriceSlider;
