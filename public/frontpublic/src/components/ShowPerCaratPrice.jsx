import React from 'react';
import { utils } from '../Helpers';
//import { chevronLeft, chevronRight } from './SVG';
export default function ShowPerCaratPrice({diamondDetail,configAppData}) {
  const showPriceFlag = diamondDetail?.showPrice;
  const shouldShowPrice = !(showPriceFlag === false || showPriceFlag === 'false');

  const rawPrice = diamondDetail?.fltPrice;
  const rawCaratWeight = diamondDetail?.caratWeight;

  const isCallForPriceString =
    typeof rawPrice === 'string' && rawPrice.trim().toLowerCase().includes('call for price');

  const numericPrice = Number(rawPrice);
  const numericCarat = Number(rawCaratWeight);

  const hasValidPrice =
    shouldShowPrice &&
    !isCallForPriceString &&
    rawPrice !== null &&
    rawPrice !== undefined &&
    rawPrice !== '' &&
    rawPrice !== '0' &&
    !Number.isNaN(numericPrice) &&
    numericPrice > 0;

  if (!hasValidPrice) {
    return <>Call for Price</>;
  }

  const formatValue = (value) => {
    if (configAppData.price_row_format === 'left') {
      if (diamondDetail.currencyFrom == 'USD') {
        return (diamondDetail.currencySymbol || "$") + utils.numberWithCommas(value);
      }
      return diamondDetail.currencyFrom + " " + (diamondDetail.currencySymbol || "$") + utils.numberWithCommas(value);
    }

    if (diamondDetail.currencyFrom == 'USD') {
      return utils.numberWithCommas(value) + (diamondDetail.currencySymbol || "$");
    }
    return utils.numberWithCommas(value) + " " + diamondDetail.currencyFrom + " " + (diamondDetail.currencySymbol || "$");
  };

  const hasValidCarat = !Number.isNaN(numericCarat) && numericCarat > 0;
  const valueToShow = hasValidCarat ? Math.round(numericPrice / numericCarat).toFixed(0) : numericPrice;

  return (  
  
     <>
      {formatValue(valueToShow)}
    </>
  );
}
