import React from 'react';
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import "./ringspecs.css";
import ShowCostInCard from './showCostInCard';

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return value;
};

/**
 * Prefer sideDiamondDetail1 array; fall back to legacy sideDiamondDetail object.
 * Avoid rendering both (Shopify/API duplicate payload).
 */
const getSideDiamondGroups = (product) => {
  if (Array.isArray(product?.sideDiamondDetail1) && product.sideDiamondDetail1.length > 0) {
    return product.sideDiamondDetail1;
  }
  if (product?.sideDiamondDetail && typeof product.sideDiamondDetail === 'object') {
    return [product.sideDiamondDetail];
  }
  return [];
};

const RingSpecificationsPopup = ({ product, onClose, configAppData }) => {
  const imageUrl = `${getImageBaseUrl()}`;
  const sideDiamondGroups = getSideDiamondGroups(product);
  const multipleSideGroups = sideDiamondGroups.length > 1;
  const centerStoneShapes = product?.centerStoneFit
    ? product.centerStoneFit.split(',').map((shape) => shape.trim()).filter(Boolean)
    : [];

  return (
    <div className="popup-overlay ring-specs-popup">
      <div className="popup-content">
        <button type="button" className="close-button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>Setting Details</h2>
        <hr className="hr" />
        <div className="setting-details">
          <div className="settings_info">
            <p>
              Setting Number: <b>{displayValue(product?.styleNumber)}</b>
            </p>
            <p>
              Price:{' '}
              <b>
                <ShowCostInCard settingDetailForCost={product} configAppData={configAppData} />
              </b>
            </p>
            <p>
              Metal Type: <b>{displayValue(product?.metalType)}</b>
            </p>
          </div>

          {sideDiamondGroups.map((item, index) => {
            const suffix = multipleSideGroups ? ` ${index + 1}` : '';
            const showQuality = multipleSideGroups || item.diamondQuality;

            return (
              <div className="side-diamond-details" key={`side-diamond-${index}`}>
                {index === 0 && <h3>Side Diamond Details</h3>}
                <div className="diamonds_info">
                  <p>
                    Number of Diamonds{suffix}: <b>{displayValue(item.noOfDiamonds)}</b>
                  </p>
                  <p>
                    Cut{suffix}: <b>{displayValue(item.diamondCut)}</b>
                  </p>
                  <p>
                    Minimum Carat Weight (ct.tw.){suffix}:{' '}
                    <b>{displayValue(item.minimumCaratWeight)}</b>
                  </p>
                  {showQuality && (
                    <p>
                      Diamond Quality{suffix}: <b>{displayValue(item.diamondQuality)}</b>
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {centerStoneShapes.length > 0 && (
            <div className="can-be-set-with">
              <div className="can-be-set-with-title">Can be set with:</div>
              <div className="can-be-set-with-box">
                {centerStoneShapes.map((shape, index) => (
                  <div className="canbesetwithspace" key={`canbesetwith_${index}`}>
                    <p>
                      <img src={`${imageUrl}/f_${shape.toLowerCase()}.svg`} alt={shape} />
                    </p>
                    <p>{shape}</p>
                    <p>
                      {displayValue(product?.centerStoneMinCarat)} - {displayValue(product?.centerStoneMaxCarat)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RingSpecificationsPopup;
