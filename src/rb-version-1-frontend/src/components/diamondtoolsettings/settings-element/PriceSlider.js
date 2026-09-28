import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-responsive-modal";
import Nouislider from "../../elements/SafeNouislider";
import "nouislider/distribute/nouislider.css";
import Skeleton from "react-loading-skeleton";

const PriceSlider = (props) => {
    // Our States

    const [open, setOpen] = useState(false);
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const [loaded, setLoaded] = useState(false);
    const marks = props.pricerangeData;
    const [startValue, setstartValue] = useState(Number(props.pricemindata));
    const [lastValue, setlastValue] = useState(Number(props.pricemaxdata));
    const [loadedfirst, setloadedfirst] = useState(false);
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
        
        setstartValue(startVal);
        setlastValue(lastVal);
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
                    setstartValue(numValue);
                    setStartInputValue(formatToTwoDecimals(numValue));
                    let sliderSelection = [];
                    sliderSelection.push(numValue);
                    sliderSelection.push(Number(lastValue));
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
                    setlastValue(numValue);
                    setLastInputValue(formatToTwoDecimals(numValue));
                    let sliderSelection = [];
                    sliderSelection.push(Number(startValue));
                    sliderSelection.push(numValue);
                    props.callBack(sliderSelection);
                }
            }
        }, 500);
    };

    const startValueOnChange = (event) => {
        validateAndUpdateStartValue(event.target.value);
    };

    const startValueOnBlur = (event) => {
        // Clear any pending debounce since we're applying immediately
        if (startDebounceRef.current) {
            clearTimeout(startDebounceRef.current);
            startDebounceRef.current = null;
        }
        
        const value = event.target.value;
        if (value === "") {
            // If empty, reset to current startValue
            setStartInputValue(formatToTwoDecimals(startValue));
            return;
        }

        const numValue = parseFloat(value);
        const minPrice = Number(marks[0].minPrice);
        const maxPrice = Number(marks[0].maxPrice);

        if (isNaN(numValue) || numValue < minPrice || numValue > maxPrice) {
            alert(`Please Enter Valid Value between ${minPrice} and ${maxPrice}`);
            setStartInputValue(formatToTwoDecimals(startValue));
        } else {
            // Use the actual float value, not integer
            setstartValue(numValue);
            setStartInputValue(formatToTwoDecimals(numValue));
            let sliderSelection = [];
            sliderSelection.push(numValue);
            sliderSelection.push(Number(lastValue));
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
            // If empty, reset to current lastValue
            setLastInputValue(formatToTwoDecimals(lastValue));
            return;
        }

        const numValue = parseFloat(value);
        const minPrice = Number(marks[0].minPrice);
        const maxPrice = Number(marks[0].maxPrice);

        if (isNaN(numValue) || numValue < minPrice || numValue > maxPrice) {
            alert(`Please Enter Valid Value between ${minPrice} and ${maxPrice}`);
            setLastInputValue(formatToTwoDecimals(lastValue));
        } else {
            // Use the actual float value, not integer
            setlastValue(numValue);
            setLastInputValue(formatToTwoDecimals(numValue));
            let sliderSelection = [];
            sliderSelection.push(Number(startValue));
            sliderSelection.push(numValue);
            props.callBack(sliderSelection);
        }
    };

    const handleKeyPress = (event, isStart) => {
        if (event.key === "Enter") {
            event.target.blur(); // Trigger blur validation
        }
    };

    useEffect(() => {
        setLoaded(true);
        let newStartValue = startValue;
        let newLastValue = lastValue;

        if (props.callbacktab === "fancycolor") {
            newStartValue = Number(props.pricemindata);
            newLastValue = Number(props.pricemaxdata);
        }

        if (
            props.isGetPriceSearch === true &&
            props.callbacktab === "labgrown"
        ) {
            newStartValue = Number(props.pricemindata);
            newLastValue = Number(props.pricemaxdata);
        }

        if (props.pricemindata === "" && props.pricemaxdata === "") {
            newStartValue = Number(marks[0].minPrice);
            newLastValue = Number(marks[0].maxPrice);
        }

        setstartValue(newStartValue);
        setlastValue(newLastValue);
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
        const showFilterInfo = Number(window.initData?.data?.[0]?.show_filter_info) === 1 || window.initData?.data?.[0]?.show_filter_info === true;

        return (
            <div className="range-slider_diamond">
                <div className="slider">
                    <h4 className="f_heading">
                        Price
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
                            Set your preferred price range to find diamonds that fit your budget. Prices are influenced by carat, cut, clarity, and color — so adjusting those filters may affect what you see here.
                            </p>
                        </div>
                    </Modal>
                    <div className="diamond-ui-slider diamond-small-slider">
                        <Nouislider
                            connect
                            behaviour={"snap"}
                            start={[startValue, lastValue]}
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
                        <span
                            className={(() => {
                                const priceRowFormat = window.initData["data"][0].price_row_format;
                                return (priceRowFormat === '1' || priceRowFormat === "right") ? "icon-right" : "icon-left";
                            })()}
                        >
                            {window.currencyFrom === "USD"
                                ? window.currency
                                : window.currencyFrom + " " + window.currency}
                        </span>
                        <input
                            type="text"
                            value={startInputValue}
                            onChange={startValueOnChange}
                            onBlur={startValueOnBlur}
                            onKeyPress={(e) => handleKeyPress(e, true)}
                            className={(() => {
                                const priceRowFormat = window.initData["data"][0].price_row_format;
                                return (priceRowFormat === '1' || priceRowFormat === "right") ? "input-left" : "";
                            })()}
                        />{" "}
                    </div>
                    <div className="input-value-right">
                        <span
                            className={(() => {
                                const priceRowFormat = window.initData["data"][0].price_row_format;
                                return (priceRowFormat === '1' || priceRowFormat === "right") ? "icon-right" : "icon-left";
                            })()}
                        >
                            {window.currencyFrom === "USD"
                                ? window.currency
                                : window.currencyFrom + " " + window.currency}
                        </span>
                        <input
                            type="text"
                            value={lastInputValue}
                            onChange={endValueOnChange}
                            onBlur={endValueOnBlur}
                            onKeyPress={(e) => handleKeyPress(e, false)}
                            className={(() => {
                                const priceRowFormat = window.initData["data"][0].price_row_format;
                                return (priceRowFormat === '1' || priceRowFormat === "right") ? "input-left" : "";
                            })()}
                        />
                    </div>
                </div>
            </div>
        );
    }
};

export default PriceSlider;
