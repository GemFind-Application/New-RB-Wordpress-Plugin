import React from 'react';
import { utils } from '../Helpers';
//import { chevronLeft, chevronRight } from './SVG';
export default function ShowFltCostInCardDiamond({diamondDetail,configAppData}) {
  const showPriceFlag = diamondDetail?.showPrice;
  const shouldShowPrice = !(showPriceFlag === false || showPriceFlag === 'false');

  const rawPrice = diamondDetail?.fltCaratPrice;
  const isCallForPriceString =
    typeof rawPrice === 'string' && rawPrice.trim().toLowerCase().includes('call for price');

  const numericPrice = Number(rawPrice);
  const hasValidNumericPrice =
    shouldShowPrice &&
    !isCallForPriceString &&
    rawPrice !== null &&
    rawPrice !== undefined &&
    rawPrice !== '' &&
    rawPrice !== '0' &&
    !Number.isNaN(numericPrice) &&
    numericPrice > 0;

  if (!hasValidNumericPrice) {
    return <>Call for Price</>;
  }

  return (  
  
    <>
    {configAppData.price_row_format === 'left'     ?
      (diamondDetail.currencyFrom =='USD' )
      ? (diamondDetail.currencySymbol || "$") + (utils.numberWithCommas(numericPrice))
      :  diamondDetail.currencyFrom + " " + (diamondDetail.currencySymbol || "$") + (utils.numberWithCommas(numericPrice))
    :
      (diamondDetail.currencyFrom =='USD' )
      ? (utils.numberWithCommas(numericPrice)) + (diamondDetail.currencySymbol || "$")
      :  utils.numberWithCommas(numericPrice) + " " + diamondDetail.currencyFrom + " " + (diamondDetail.currencySymbol || "$")
    }
  </>
  );
}
