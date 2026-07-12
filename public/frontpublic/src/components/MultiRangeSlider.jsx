import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { utils } from "../Helpers";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import './MultiRangeSlider.css';
const MultiRangeSlider = ({ min, max, onChange,value ,isPrice=true,showPercent,step,currencyToShow,currencyPosition,currencyFrom}) => {
//console.log("value of step=="+step)
  const [minVal, setMinVal] = useState(parseFloat(value[0]));
  const [maxVal, setMaxVal] = useState(parseFloat(value[1]));
  const [minD, setMinD] = useState(min);
  const [maxD, setMaxD] = useState(max);
  const [showOnlyValue, setShowOnlyValue] = useState(true);
  //console.log(value)
  const [labelMax, setLabelMax] = useState(parseFloat(value[1]));
  const [labelMin, setLabelMin] = useState(parseFloat(value[0]));
  const minValRef = useRef(null);
  const maxValRef = useRef(null);
  const range = useRef(null);
//console.log(labelMax)
  const getPercent = useCallback(
    (value) => Math.round(((value - minD) / (maxD - minD)) * 100),
    [minD, maxD]
  );

  useEffect(() => {
    /*if (minValRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(maxVal);
      if (range.current) {

        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }*/
  }, []);

  useEffect(() => {
    setMinVal(parseFloat(value[0]));
    setMaxVal(parseFloat(value[1]));
   // setMinD(min);
    //setMaxD(max)
    //onChange({ min: minVal, max: maxVal });
  }, [value]);

  // Track if user is typing in input
  const [isInputting, setIsInputting] = useState(false);
  const [displayMinVal, setDisplayMinVal] = useState('');
  const [displayMaxVal, setDisplayMaxVal] = useState('');
  const debounceTimeout = useRef();

  // Initialize display values
  useEffect(() => {
    setDisplayMinVal(formatValue(parseFloat(value[0])));
    setDisplayMaxVal(formatValue(parseFloat(value[1])));
  }, []);

  // Update display values when actual values change (from slider)
  useEffect(() => {
    if (!isInputting) {
      setDisplayMinVal(formatValue(minVal));
      setDisplayMaxVal(formatValue(maxVal));
    }
  }, [minVal, maxVal, isInputting]);

  // Update min/max from input
  const handleMinChange = (event) => {
    const inputValue = event.target.value;
    setDisplayMinVal(inputValue);
    setIsInputting(true);
    
    // Parse the raw value for internal calculations
    const rawValue = inputValue.replace(/[,$]/g, '');
    const numericValue = parseFloat(rawValue);
    
    if (!isNaN(numericValue)) {
      setMinVal(numericValue);
    }
  };
  
  const handleMaxChange = (event) => {
    const inputValue = event.target.value;
    setDisplayMaxVal(inputValue);
    setIsInputting(true);
    
    // Parse the raw value for internal calculations
    const rawValue = inputValue.replace(/[,$]/g, '');
    const numericValue = parseFloat(rawValue);
    
    if (!isNaN(numericValue)) {
      setMaxVal(numericValue);
    }
  };

  // Debounce only when user is typing in input
  useEffect(() => {
    if (isInputting) {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        callAction();
        setIsInputting(false);
        // Format the display values after user stops typing
        setDisplayMinVal(formatValue(minVal));
        setDisplayMaxVal(formatValue(maxVal));
      }, 700); // 700 milliseconds
      return () => clearTimeout(debounceTimeout.current);
    }
  }, [minVal, maxVal, isInputting]);

  const rangeSelectorprops = (newValue) => {
    setShowOnlyValue(false);
    setMinVal(Number(newValue[0]));
    setMaxVal(Number(newValue[1]));
    onChange({ min: Number(newValue[0]), max: Number(newValue[1]) });
  };
  const showupdatedvalue=(newValue)=>{
    setShowOnlyValue(true)
    setLabelMax(Number(newValue[1]))
    setLabelMin(Number(newValue[0]))
   //console.log(newValue[0])
  }
  // Format carat values to 2 decimal places
  const formatCaratValue = (value) => {
    return parseFloat(value).toFixed(2);
  };

  // Format price values with comma separators
  const formatPriceValue = (value) => {
    return Number(value).toLocaleString();
  };

  // Format value based on type
  const formatValue = (value) => {
    if (isPrice) {
      return formatPriceValue(value);
    } else {
      return formatCaratValue(value);
    }
  };

  const callAction=()=>{
    onChange({min:Number(minVal),max:Number(maxVal)})
  }
 // onBlur={callAction}
 //console.log(labelMax)
  return (
    <div className="gf_container price_slider_box" style={{width:'50%'}}>
      {step==1 ?
     <Nouislider
              connect
              behaviour={"tap"}
              start={[
                minVal,maxVal
              ]}    
              step={1}          
              range={{
                min:parseFloat(min),
                max: parseFloat(max),
              }}
              onUpdate={showupdatedvalue}
              onChange={rangeSelectorprops}
            />: <Nouislider
            connect
            behaviour={"tap"}
            start={[
              minVal,maxVal
            ]}    
            tooltips={true}      
            range={{
              min:parseFloat(min),
              max: parseFloat(max),
            }}
            onUpdate={showupdatedvalue}
            onChange={rangeSelectorprops}
          />
            }
          <div className='sliderValues'>
            <div className="sliderValues1">
              <span className={currencyPosition=='left'?'currencySymbolleft':'currencySymbol'}>{isPrice?currencyToShow:''}</span>
              <input
                    type="text"
                    value={displayMinVal}
                    onChange={handleMinChange}
                    className="slider__left-value"
                  />
              <span className='percSymbol'>{showPercent?'%':''}</span>                
            </div>
            <div className="sliderValues2">
              <span className={(currencyPosition=='left' && currencyFrom!='USD')?'currencySymbolleft':'currencySymbol'}>
                {isPrice?currencyToShow:''}</span>
            <input
                  type="text"
                  value={displayMaxVal}
                  onChange={handleMaxChange}
                  className="slider__right-value"
                  />
              <span className='percSymbol'>{showPercent?'%':''}</span>
              </div>
          </div>

    </div>
  );
};

MultiRangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MultiRangeSlider;