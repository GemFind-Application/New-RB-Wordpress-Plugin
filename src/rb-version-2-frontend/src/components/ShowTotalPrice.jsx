import React from 'react';
import { utils } from '../Helpers';
//import { chevronLeft, chevronRight } from './SVG';
export default function ShowTotalPrice({settingDetailForCost,diamondDetail,configAppData}) {
  const showPriceFlagSetting = settingDetailForCost?.showPrice;
  const showPriceFlagDiamond = diamondDetail?.showPrice;
  const shouldShowPrice =
    !(showPriceFlagSetting === false || showPriceFlagSetting === 'false') &&
    !(showPriceFlagDiamond === false || showPriceFlagDiamond === 'false');

  const rawSettingCost = settingDetailForCost?.cost;
  const rawDiamondPrice = diamondDetail?.fltPrice;

  const isCallForPriceString = (value) =>
    typeof value === 'string' && value.trim().toLowerCase().includes('call for price');

  const isValidNumericPrice = (value) => {
    if (value === null || value === undefined || value === '' || value === '0') {
      return false;
    }
    if (isCallForPriceString(value)) {
      return false;
    }
    const num = Number(value);
    return !Number.isNaN(num) && num > 0;
  };

  if (!shouldShowPrice || !isValidNumericPrice(rawSettingCost) || !isValidNumericPrice(rawDiamondPrice)) {
    return <>Call for Price</>;
  }

  // Calculate total price and round to 2 decimal places
  const totalPrice = Number((Number(rawSettingCost) + Number(rawDiamondPrice)).toFixed(2));
  
  return (    
     <>
      {configAppData.price_row_format === 'left'     ?
        (diamondDetail.currencyFrom =='USD' )
        ? (diamondDetail.currencySymbol || "$") + (utils.numberWithCommas(totalPrice))
        :  diamondDetail.currencyFrom + " " + (diamondDetail.currencySymbol || "$") + (utils.numberWithCommas(totalPrice))
      :
        (diamondDetail.currencyFrom =='USD' )
        ? (utils.numberWithCommas(totalPrice)) + (diamondDetail.currencySymbol || "$")
        :  utils.numberWithCommas(totalPrice) + " " + diamondDetail.currencyFrom + " " + (diamondDetail.currencySymbol || "$")
      }
    </>
  );
}
