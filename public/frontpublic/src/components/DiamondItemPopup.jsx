import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ShowCostInCardDiamond from './showCostInCardDiamond';

const DiamondDetailsPopup = ({ diamond, onClose,additionOptionSetting ,configAppData}) => {
  const popupRef = useRef(null);

  useEffect(() => {
    const productCard = popupRef.current.closest('.product-card');
    if (productCard) {
      const { height } = productCard.getBoundingClientRect();
      popupRef.current.style.height = `${height}px`;
    }
  }, []);

  return (
    <div className="diamond-details-popup" ref={popupRef}>
      <div className="popup-header">
        <h2>Diamond Details</h2>
        <button className="close-button" onClick={onClose}>...</button>
      </div>
      <div className="popup-content">
        <DetailRow label="Diamond ID:" value={diamond.diamondId} />
        <DetailRow label="Shape:" value={diamond.shape} />
        {additionOptionSetting.show_In_House_Diamonds_Column_with_SKU && 
          <DetailRow label="Availability:" value={diamond.inhouse ? (diamond.inhouse === "Yes" ? "In Store Now" : "By Request") : '-'} />
        }      
        <DetailRow label="Carat:" value={diamond.carat?diamond.carat:'-'} />
        <DetailRow label="Color:" value={diamond.color?diamond.color:'-'} />
        <DetailRow label="Intensity:" value={diamond.intensity || diamond.fancyColorIntensity} />
        <DetailRow label="Clarity:" value={diamond.clarity?diamond.clarity:'-'} />
        <DetailRow label="Cut:" value={diamond.cut?diamond.cut:'-'} />
        <DetailRow label="Depth:" value={diamond.depth?diamond.depth+'%':'-'} />
        <DetailRow label="Table:" value={diamond.table? `${diamond.table}%`:'-'} />
        <DetailRow label="Polish:" value={diamond.polish?diamond.polish:'-'} />
        <DetailRow label="Symmetry:" value={diamond.symmetry?diamond.symmetry:'-'} />
        <DetailRow label="Measurement:" value={diamond.measurement?diamond.measurement:'-'} />
        <DetailRow label="Certificate:" value={diamond.certificate?diamond.certificate:'-'} />
        <DetailRow label="Price:" value={<ShowCostInCardDiamond configAppData={configAppData} diamondDetail={diamond}></ShowCostInCardDiamond>} />
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => {
  if (value === null || value === undefined || typeof value !== 'object') {
    const text = value === null || value === undefined ? '' : String(value).trim();
    if (text === '' || text === '-' || text === '—') {
      return null;
    }
  }
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
};

DiamondDetailsPopup.propTypes = {
  diamond: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DiamondDetailsPopup;