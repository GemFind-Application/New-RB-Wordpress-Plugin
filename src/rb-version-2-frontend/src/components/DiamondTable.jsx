import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import DiamondTableRow from "./DiamondTableRow";
import "./DiamondTable.css";

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

const DiamondTable = ({ 
  diamonds = [], 
  saveFiltersAfterDetails,
  className = "",
  configAppData,
  addCompareDiamondIds,
  compareDiamondsId,
  additionOptionSetting,
  isLabGrown,
  onSort
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null; // Reset to no sort
    }
    setSortConfig({ key, direction });
    if (onSort) {
      const sortKey = key === 'table' ? 'TableMeasure' : key;
      onSort(sortKey, direction);
    }
  };

  const getSortClass = (columnKey) => {
    if (sortConfig.key === columnKey && sortConfig.direction) {
      return sortConfig.direction === 'asc' ? 'ASC' : 'DESC';
    }
    return '';
  };

  // Hide table view on mobile
  if (isMobile) {
    return null;
  }

  return (
    <div className={`diamond-table-container ${className}`}>
      <div className="diamond-table-wrapper">
        <table className="diamond-table-main">
          <thead>
            <tr className="table-header-row">
              <th className="table-header compare-header">
                <span className="header-content compare-header-text">Compare</span>
              </th>
              <th 
                className={`table-header shape-header table-sort ${getSortClass('shape')}`}
                onClick={() => handleSort('shape')}
              >
                <span className="header-content">
                  Shape
                </span>
              </th>
              <th 
                className={`table-header carat-header table-sort ${getSortClass('carat')}`}
                onClick={() => handleSort('carat')}
              >
                <span className="header-content">
                  Carat
                </span>
              </th>
              <th 
                className={`table-header cut-header table-sort ${getSortClass('cut')}`}
                onClick={() => handleSort('cut')}
              >
                <span className="header-content">
                  Cut
                </span>
              </th>
              <th 
                className={`table-header color-header table-sort ${getSortClass('color')}`}
                onClick={() => handleSort('color')}
              >
                <span className="header-content">
                  Color
                </span>
              </th>
              <th 
                className={`table-header clarity-header table-sort ${getSortClass('clarity')}`}
                onClick={() => handleSort('clarity')}
              >
                <span className="header-content">
                  Clarity
                </span>
              </th>
              <th 
                className={`table-header depth-header table-sort ${getSortClass('depth')}`}
                onClick={() => handleSort('depth')}
              >
                <span className="header-content">
                  Depth
                </span>
              </th>
              <th 
                className={`table-header table-header-column table-sort ${getSortClass('table')}`}
                onClick={() => handleSort('table')}
              >
                <span className="header-content">
                  Table
                </span>
              </th>
              <th 
                className={`table-header certificate-header table-sort ${getSortClass('certificate')}`}
                onClick={() => handleSort('certificate')}
              >
                <span className="header-content">
                  Certificate
                </span>
              </th>
              <th 
                className={`table-header price-header table-sort ${getSortClass('price')}`}
                onClick={() => handleSort('price')}
              >
                <span className="header-content">
                  Price (USD)
                </span>
              </th>
              <th className="table-header details-header" style={{width: '20px'}}>
              </th>
            </tr>
          </thead>
          <tbody>
            {diamonds && diamonds.length > 0 ? diamonds.map((diamond, index) => (
              <DiamondTableRow
                key={diamond.diamondId || `diamond-${index}`}
                saveFiltersAfterDetails={saveFiltersAfterDetails}
                diamond={diamond}
                isLabGrown={isLabGrown}
                configAppData={configAppData}
                addCompareDiamondIds={addCompareDiamondIds}
                compareDiamondsId={compareDiamondsId}
                additionOptionSetting={additionOptionSetting}
              />
            )) : (
              <tr>
                <td colSpan={isMobile ? 8 : 11} className="no-diamonds-cell">
                  <div className="no-diamonds-message">No diamonds found</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

DiamondTable.propTypes = {
  diamonds: PropTypes.array.isRequired,
  saveFiltersAfterDetails: PropTypes.func,
  className: PropTypes.string,
  configAppData: PropTypes.object,
  addCompareDiamondIds: PropTypes.func,
  compareDiamondsId: PropTypes.array,
  additionOptionSetting: PropTypes.object,
  isLabGrown: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  onSort: PropTypes.func,
};

export default DiamondTable;
