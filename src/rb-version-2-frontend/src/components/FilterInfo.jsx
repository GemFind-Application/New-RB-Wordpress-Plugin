import React, { useState } from 'react';
import { Info } from 'lucide-react';

const FilterInfo = ({ filterType }) => {
  const [showPopup, setShowPopup] = useState(false);

  const getPopupContent = () => {
    switch (filterType) {
      case 'shape':
        return 'A diamond\'s shape is not the same as a diamond\'s cut. The shape refers to the general outline of the stone, and not its light refractive qualities. Look for a shape that best suits the ring setting you have chosen, as well as the recipient\'s preference and personality. Here are some of the more common shapes that Our site offers:';
      case 'metals':
        return 'This refer to different type of Metal Type to filter and select the appropriate ring as per your requirements. Look for a metal type best suit of your chosen ring.';
      case 'price':
        return 'This refer to different type of Price to filter and select the appropriate ring as per your requirements. Look for best suit price of your chosen ring.';
      default:
        return '';
    }
  };

  return (
    <div
      className="filter-info"
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
    >
      <Info size={16} />
      {showPopup && (
        <div className="filter-info-popup">
          <p>{getPopupContent()}</p>
        </div>
      )}
    </div>
  );
};

export default FilterInfo;