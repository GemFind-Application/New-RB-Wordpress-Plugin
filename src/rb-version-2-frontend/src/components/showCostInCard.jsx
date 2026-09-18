import React from 'react';
import { utils } from '../Helpers';
//import { chevronLeft, chevronRight } from './SVG';
export default function ShowCostInCard({settingDetailForCost,configAppData}) {
  const showPriceFlag = settingDetailForCost?.showPrice;
  const shouldShowPrice = !(showPriceFlag === false || showPriceFlag === 'false');

  const rawCost = settingDetailForCost?.cost;
  const isCallForPriceString =
    typeof rawCost === 'string' && rawCost.trim().toLowerCase().includes('call for price');

  const numericCost = Number(typeof rawCost === 'string' ? rawCost.trim() : rawCost);
  const hasValidCost =
    shouldShowPrice &&
    !isCallForPriceString &&
    rawCost !== null &&
    rawCost !== undefined &&
    rawCost !== '' &&
    rawCost !== '0' &&
    !Number.isNaN(numericCost) &&
    numericCost > 0;
  
  return (    
     <>
      {hasValidCost ? 
        configAppData.price_row_format === 'left'     ?
          (settingDetailForCost.currencyFrom =='USD' )
          ? (settingDetailForCost.currencySymbol || "$") + (utils.numberWithCommas(numericCost))
          :  settingDetailForCost.currencyFrom + " " + (settingDetailForCost.currencySymbol || "$") + (utils.numberWithCommas(numericCost))
        :
          (settingDetailForCost.currencyFrom =='USD' )
          ? (utils.numberWithCommas(numericCost)) + (settingDetailForCost.currencySymbol || "$")
          :  utils.numberWithCommas(numericCost) + " " + settingDetailForCost.currencyFrom + " " + (settingDetailForCost.currencySymbol || "$")

      : "Call for Price"  
      
      }
    </>
  );
}
