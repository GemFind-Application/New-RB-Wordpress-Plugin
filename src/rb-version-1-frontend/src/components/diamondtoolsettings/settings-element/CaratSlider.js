import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-responsive-modal";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import Skeleton from "react-loading-skeleton";
import useDebouncedCallback from "../../../utils/useDebouncedCallback";
import { useCookies } from "react-cookie";
import caratJpg from '../../../images/carat.jpg';
import { isSettingFilterRelaxed } from "../../../wp/settingFilterRelax";

const CaratSlider = (props) => {
    const [open, setOpen] = useState(false);
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const [loaded, setLoaded] = useState(false);
    const marks = props.caratSliderData;
    const [startValue, setstartValue] = useState(Number(props.minCarat));
    const [lastValue, setlastValue] = useState(Number(props.maxCarat));
    const [getMinValue, setMinValue] = useState();
    const [getMaxValue, setMaxValue] = useState();

    const [getsettingcookies, setsettingcookies] = useCookies([
        "_shopify_ringsetting",
    ]);
    const isInitialMount = useRef(true);
    const prevTabRef = useRef(props.callbacktab);

    const rangeSelectorprops = (newValue) => {
        commitTypedRange.cancel();
        setstartValue(Number(newValue[0]));
        setlastValue(Number(newValue[1]));
        let sliderSelection = [];
        sliderSelection.push(Number(newValue[0]));
        sliderSelection.push(Number(newValue[1]));
        props.callBack(sliderSelection);
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

        const tabChanged = prevTabRef.current !== props.callbacktab;
        const noValuesProvided =
            props.minCarat === "" && props.maxCarat === "";
        const hasValidValues =
            props.minCarat !== "" && props.maxCarat !== "";

        const shouldResetValues =
            isInitialMount.current || tabChanged || noValuesProvided;

        if (shouldResetValues) {
            if (props.callbacktab === "fancycolor" && hasValidValues) {
                setstartValue(Number(props.minCarat));
                setlastValue(Number(props.maxCarat));
            } else if (
                noValuesProvided &&
                props.caratSliderData &&
                props.caratSliderData.length > 0
            ) {
                setstartValue(Number(props.caratSliderData[0].minCarat));
                setlastValue(Number(props.caratSliderData[0].maxCarat));
            } else if (hasValidValues && (isInitialMount.current || tabChanged)) {
                setstartValue(Number(props.minCarat));
                setlastValue(Number(props.maxCarat));
            }
        }

        if (getsettingcookies._shopify_ringsetting && !isSettingFilterRelaxed()) {
            setMinValue(
                Number(getsettingcookies._shopify_ringsetting[0].ringmincarat)
            );
            setMaxValue(
                Number(getsettingcookies._shopify_ringsetting[0].ringmaxcarat)
            );
        } else {
            setMinValue(undefined);
            setMaxValue(undefined);
        }

        if (isInitialMount.current) {
            isInitialMount.current = false;
        }
        prevTabRef.current = props.callbacktab;
    }, [
        props.callbacktab,
        props.minCarat,
        props.maxCarat,
        props.caratSliderData,
        getsettingcookies,
    ]);

    if (loaded === false) {
        return <Skeleton height={80} />;
    } else {
        const showFilterInfo = Number(window.initData?.data?.[0]?.show_filter_info) === 1 || window.initData?.data?.[0]?.show_filter_info === true;

        return (
            <div className="range-slider_diamond">
                <div className="slider">
                    <h4 className="f_heading diamond_heading">
                        CARAT
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
                                Carat is a unit of measurement to determine a
                                diamond’s weight. Typically, a higher carat
                                weight means a larger looking diamond, but that
                                is not always the case. Look for the mm
                                measurements of the diamond to determine its
                                visible size.
                            </p>
                            <img
                                src={
                                    caratJpg
                                }
                                alt="Carat"
                                className="popup-image"
                            ></img>
                        </div>
                    </Modal>

                    <div className="diamond-ui-slider diamond-small-slider">
                        <Nouislider
                            connect
                            behaviour={"tap"}
                            start={[
                                startValue === ""
                                    ? Number(
                                          getMinValue
                                              ? getMinValue
                                              : Number(marks[0].minCarat)
                                      )
                                    : Number(startValue),
                                lastValue === ""
                                    ? Number(
                                          getMaxValue
                                              ? getMaxValue
                                              : Number(marks[0].maxCarat)
                                      )
                                    : Number(lastValue),
                            ]}
                            range={{
                                min: getMinValue
                                    ? getMinValue
                                    : Number(marks[0].minCarat),
                                max: getMaxValue
                                    ? getMaxValue
                                    : Number(marks[0].maxCarat),
                            }}
                            tooltips={true}
                            //onUpdate={rangeSelector}
                            onChange={rangeSelectorprops}
                        />
                    </div>
                </div>
                <div className="input-value dia-input-value">
                    <div className="input-value-left">
                        <input
                            type="text"
                            value={startValue}
                            onChange={startValueOnChange}
                            onBlur={commitTypedRange.flush}
                        />{" "}
                    </div>
                    <div className="input-value-right">
                        <input
                            type="text"
                            value={lastValue}
                            onChange={endValueOnChange}
                            onBlur={commitTypedRange.flush}
                        />
                    </div>
                </div>
            </div>
        );
    }
};

export default CaratSlider;
