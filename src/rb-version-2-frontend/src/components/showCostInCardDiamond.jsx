import React from 'react';
import { utils } from '../Helpers';
//import { chevronLeft, chevronRight } from './SVG';
export default function ShowCostInCardDiamond({diamondDetail,configAppData}) {  
  const rawPrice = diamondDetail?.fltPrice;

  const showPriceFlag = diamondDetail?.showPrice;
  const shouldShowPrice = !(showPriceFlag === false || showPriceFlag === 'false');

  const isCallForPriceString =
    typeof rawPrice === 'string' && rawPrice.trim().toLowerCase().includes('call for price');

  const numericPrice = Number(rawPrice);
  const hasValidNumericPrice =
    !isCallForPriceString &&
    rawPrice !== null &&
    rawPrice !== undefined &&
    rawPrice !== '' &&
    rawPrice !== '0' &&
    !Number.isNaN(numericPrice) &&
    numericPrice > 0;

  if (!shouldShowPrice || !hasValidNumericPrice) {
    return <>Call for Price</>;
  }

  const formattedNumber = utils.numberWithCommas(Math.trunc(numericPrice));

  return (    
     <>
      {configAppData.price_row_format === 'left' ?
        (diamondDetail.currencyFrom =='USD' )
            ? (diamondDetail.currencySymbol || "$") + (formattedNumber)
            : diamondDetail.currencyFrom + " " + (diamondDetail.currencySymbol || "$") + (formattedNumber)
      :   (diamondDetail.currencyFrom =='USD' )
            ? (formattedNumber) + (diamondDetail.currencySymbol || "$")
            : formattedNumber + " " + diamondDetail.currencyFrom + " " + (diamondDetail.currencySymbol || "$")
    }
    </>
  );
}
