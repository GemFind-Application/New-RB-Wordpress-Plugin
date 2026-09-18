import { useState, useEffect } from "react";
import DiamondTable from "./DiamondTable";
import PropTypes from "prop-types";

import "./list1.css";

const List1 = ({ saveFiltersAfterDetails, className = "", diamonds = [], configAppData, addCompareDiamondIds, compareDiamondsId, additionOptionSetting, isLabGrown, onSort }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render list view on mobile
  if (isMobile) {
    return null;
  }
  
  return (
    <div className={`list5 ${className}`}>
      <DiamondTable 
        diamonds={diamonds}
        saveFiltersAfterDetails={saveFiltersAfterDetails}
        isLabGrown={isLabGrown}
        configAppData={configAppData}
        addCompareDiamondIds={addCompareDiamondIds}
        compareDiamondsId={compareDiamondsId}
        additionOptionSetting={additionOptionSetting}
        onSort={onSort}
      />
    </div>
  );
};

List1.propTypes = {
  className: PropTypes.string,
};

export default List1;
