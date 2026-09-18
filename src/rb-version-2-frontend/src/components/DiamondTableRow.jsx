import React, { useState, useEffect } from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import DiamondExpandDetail from "./diamond-expand-details";
import ShowCostInCardDiamond from "./showCostInCardDiamond";
import VideoModal from "./VideoModal";
import { diamondService } from "../Services";
import { utils } from "../Helpers";
import { useNavigate } from 'react-router-dom';

// Hook to detect screen width
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

const DiamondTableRow = ({ 
  className = "", 
  diamond,
  isLabGrown,
  configAppData,
  addCompareDiamondIds,
  compareDiamondsId,
  additionOptionSetting,
  saveFiltersAfterDetails
}) => {
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDiamondPresentInCompare, setIsDiamondPresentInCompare] = useState(false);
  const imageUrl = `${getImageBaseUrl()}`;
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Calculate colSpan based on screen size (11 columns total, 3 hidden on mobile = 8)
  const expandColSpan = isMobile ? 8 : 11;

  useEffect(() => {   
    // Handle both old format (array of strings) and new format (array of objects)
    const isDiamondPresent = compareDiamondsId.some(item => {
      const itemId = typeof item === 'object' ? item.diamondId : item;
      return String(itemId) === String(diamond.diamondId);
    });
    setIsDiamondPresentInCompare(isDiamondPresent);
  }, [compareDiamondsId, diamond.diamondId]);

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleCompareChange = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (addCompareDiamondIds) {
      addCompareDiamondIds(diamond.diamondId, isLabGrown);
    }
  };

  const handleVideoIconClick = async(e) => {
    e.stopPropagation(); 
    setShowVideoPopup(false);
    try {     
      const res = await diamondService.getDiamondVideoUrl(diamond.diamondId);  
      if(res) {
        if(res.showVideo !== false){
          setVideoUrl(res.videoURL);         
          setShowVideoPopup(true);          
        } else {
          setShowVideoPopup(false);
        }        
      }   
    } catch (error) {
      console.error("Error fetching filter data:", error);
      setError("Failed to fetch filter data. Please try again later.");
    }  
  }; 

  const getdiamondDetail = (e) => {
    if (saveFiltersAfterDetails) {
      saveFiltersAfterDetails();
    }
    const diamondDetailUrl = `${import.meta.env.VITE_DIAMOND_DETAIL_PAGE}`;
    navigate("/" + diamondDetailUrl + "/" + utils.getDiamondViewUrl(diamond, isLabGrown));
  };

  return (
    <>
      <tr 
        className={`diamond-table-row ${className} ${isExpanded ? 'expanded' : ''}`}
        onClick={getdiamondDetail}
      >
        {/* Compare Column */}
        <td className="table-cell compare-cell" onClick={(e) => e.stopPropagation()}>
          <label className="compare-checkbox-label" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              className="compare-checkbox"
              checked={isDiamondPresentInCompare}
              onChange={handleCompareChange}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
            <span className="compare-checkbox-custom"></span>
          </label>
        </td>

        {/* Shape Column */}
        <td className="table-cell shape-cell">
          <div className="shape-cell-content">
            <img 
              className="shape-diamond-image" 
              alt={diamond.shape || 'Diamond'} 
              src={diamond.biggerDiamondimage || `${imageUrl}/f_${(diamond.shape || '').toLowerCase()}.svg`}
              onError={(e) => {
                // Fallback to shape icon if image fails
                e.target.src = `${imageUrl}/f_${(diamond.shape || '').toLowerCase()}.svg`;
                e.target.className = 'shape-icon';
              }}
            />
            <span className="shape-name">{diamond.shape && diamond.shape !== "" ? diamond.shape : '-'}</span>
          </div>
        </td>

        {/* Carat Column */}
        <td className="table-cell carat-cell">
          <span className="diamond-value">{diamond.carat && diamond.carat !== "" ? diamond.carat : '-'}</span>
        </td>

        {/* Cut Column */}
        <td className="table-cell cut-cell">
          <span className="diamond-value">{diamond.cut && diamond.cut !== "" ? diamond.cut : '-'}</span>
        </td>

        {/* Color Column */}
        <td className="table-cell color-cell">
          <span className="diamond-value">{diamond.color && diamond.color !== "" ? diamond.color : '-'}</span>
        </td>

        {/* Clarity Column */}
        <td className="table-cell clarity-cell">
          <span className="diamond-value">{diamond.clarity && diamond.clarity !== "" ? diamond.clarity : '-'}</span>
        </td>

        {/* Depth Column */}
        <td className="table-cell depth-cell">
          <span className="diamond-value">{diamond.depth && diamond.depth !== "" ? `${diamond.depth}%` : '-'}</span>
        </td>

        {/* Table Column */}
        <td className="table-cell table-cell-column">
          <span className="diamond-value">{diamond.table && diamond.table !== "" ? `${diamond.table}%` : '-'}</span>
        </td>

        {/* Certificate Column */}
        <td className="table-cell certificate-cell">
          <span className="diamond-value">{diamond.cert && diamond.cert !== "" ? diamond.cert : '-'}</span>
        </td>

        {/* Price Column */}
        <td className="table-cell price-cell">
          <span className="diamond-price">
            <ShowCostInCardDiamond configAppData={configAppData} diamondDetail={diamond} />
          </span>
        </td>

        {/* Details Column */}
        <td className="table-cell details-cell">
          <div className="details-actions">
            {/* {diamond.hasVideo && (
              <div 
                className="actions4 list-diamond--video" 
                id={diamond.diamondId} 
                onClick={(e) => handleVideoIconClick(e)}
              >
                <img className="video-icon" alt="video" src={`${imageUrl}/video.svg`} />
              </div>
            )} */}
            <div className="button25 show--more-diamond_info" onClick={(e) => handleToggleExpand(e)}>
              <img 
                className="button-item" 
                alt={isExpanded ? "collapse" : "expand"} 
                src={isExpanded ? `${imageUrl}/inverted-2-3.svg` : `${imageUrl}/vector-2-3.svg`}
              />
            </div>
          </div>
        </td>
      </tr>
      
      {/* Expanded Detail Row */}
      {isExpanded && (
        <tr className="expand-detail-row">
          <td colSpan={expandColSpan} className="expand-detail-cell">
            <div className="diamond-expand-detail-wrapper">
              <DiamondExpandDetail  
                configAppData={configAppData} 
                diamond={diamond} 
                getdiamondDetail={getdiamondDetail} 
                isLabGrown={isLabGrown}
              />
            </div>
          </td>
        </tr>
      )}
      
      {/* Video Modal - rendered via portal outside table */}
      {showVideoPopup && videoUrl !== "" && createPortal(
        <VideoModal src={videoUrl} onClose={() => setShowVideoPopup(false)} />,
        document.body
      )}
    </>
  );
};

DiamondTableRow.propTypes = {
  className: PropTypes.string,
  diamond: PropTypes.object.isRequired,
  isLabGrown: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  configAppData: PropTypes.object,
  addCompareDiamondIds: PropTypes.func,
  compareDiamondsId: PropTypes.array,
  additionOptionSetting: PropTypes.object,
  saveFiltersAfterDetails: PropTypes.func,
};

export default DiamondTableRow;
