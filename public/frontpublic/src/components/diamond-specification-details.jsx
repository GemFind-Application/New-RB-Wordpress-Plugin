import React from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import PropTypes from "prop-types";
import "./diamond-details1.css";
import ImageGallery from 'react-image-gallery';
import ShowCostInCardDiamond from "./showCostInCardDiamond";
import ShowPerCaratPrice from "./ShowPerCaratPrice";
import { utils } from "../Helpers";

const SpecRow = ({ label, value, valueClassName = "spec-values", ValueTag = "b" }) => {
  if (!utils.hasSpecValue(value)) {
    return null;
  }
  const ValueComponent = ValueTag;
  return (
    <div className="spec-labels1">
      <div className="stats-label">{label}</div>
      <ValueComponent className={valueClassName}>{value}</ValueComponent>
    </div>
  );
};

const DiamondSpecificationDetail = ({ className = "", diamond,onClose,configAppData,additionOptionSetting }) => {
  const images = [];
  // if (diamond.diamondImage) {
  //   images.push({
  //     original: diamond.diamondImage,
  //     thumbnail: diamond.diamondImage,
  //   });
  // }
  if (diamond.biggerDiamondimage) {
    images.push({
      original: diamond.biggerDiamondimage,
      thumbnail: diamond.biggerDiamondimage,
    });
  }
  const imageUrl = `${getImageBaseUrl()}`;
  return (
    <div className="popup-overlay ring-specs-popup diamond-specs-popup">
      <div className="popup-content">
        <h2>Diamond Details</h2>
        <button className="close-button" onClick={onClose}>×</button>
      <section className="content2">
        <div className="top2">
          <p className="diamond-details1">{diamond.shape} {' '}{diamond.caratWeight} CARAT</p>
          <div className="stats">
            <div className="spec-labels1">
              <div className="stats-label">{"Stock Number"}:</div>
              <a className="spec-values">{ additionOptionSetting.show_In_House_Diamonds_First ?
                       diamond.stockNumber:
                       diamond.diamondId}</a>
            </div>
            <div className="spec-labels1">
              <div className="stats-label">Price:</div>
              <b className="spec-values"><ShowCostInCardDiamond configAppData={configAppData} diamondDetail={diamond}></ShowCostInCardDiamond></b>
            </div>
            { additionOptionSetting.show_In_House_Diamonds_Column_with_SKU &&
              utils.hasSpecValue(diamond.txtinhouse) && (
              <div className="spec-labels1">
                <div className="stats-label">In House:</div>
                <b className="spec-values">{diamond.txtinhouse}</b>
              </div>
            )}

            <div className="spec-labels1">
              <div className="stats-label">Price Per Carat:</div>
              <a className="spec-values">{diamond.fltPrice ? <ShowPerCaratPrice diamondDetail={diamond} configAppData={configAppData}></ShowPerCaratPrice> : '-'}</a>
            </div>
            <SpecRow label="Carat Weight:" value={diamond.caratWeight} />
            <SpecRow label="Cut:" value={diamond.cut} ValueTag="a" />
            <SpecRow label="Color:" value={diamond.color} />
            <SpecRow label="Clarity:" value={diamond.clarity} />
            <SpecRow label="Polish:" value={diamond.polish} />
            <SpecRow label="Symmetry:" value={diamond.symmetry} />
            <SpecRow label="Girdle:" value={diamond.gridle || diamond.girdleThin} />
            <SpecRow label="Culet:" value={diamond.culet} />
            <SpecRow label="Fluorescence:" value={diamond.fluorescence} />
            <SpecRow label="Intensity:" value={diamond.fancyColorIntensity} />
          </div>
        </div>
        <div className="number">
        <div className="measurement-labels">
            <img
              className="fi-8467779-icon"
              loading="lazy"
              alt=""
              src={`${imageUrl}`+"/fi-8467779.svg"}
            />
            <div className="x-x-measurement">
              <b className="x-x-values">{diamond.caratWeight || '-'}</b>
              <div className="depth">Carat</div>
            </div>
          </div>
          <div className="measurement-labels1">
            <img
              className="fi-8467779-icon"
              loading="lazy"
              alt=""
              src={`${imageUrl}`+"/fi-12791189.svg"}
            />
            <div className="x-x-measurement">
              <b className="b4">{diamond.clarity || '-'}</b>
              <div className="table">Clarity</div>
            </div>
          </div>
          <div className="measurement-labels2">
          <img
              className="fi-8467779-icon"
              loading="lazy"
              alt=""
              src={`${imageUrl}`+"/fi-8467779.svg"}
            />
            {/* <img
              className="fi-8467779-icon"
              loading="lazy"
              alt=""
             src={`${imageUrl}`+"/fi-8052211.svg"}
            /> */}
            <div className="x-x-measurement">
              <b className="x371x232">{diamond.color || '-'}</b>
              <div className="measurement">Color</div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
};

DiamondSpecificationDetail.propTypes = {
  className: PropTypes.string,
  diamond: PropTypes.object.isRequired,
};

export default DiamondSpecificationDetail;