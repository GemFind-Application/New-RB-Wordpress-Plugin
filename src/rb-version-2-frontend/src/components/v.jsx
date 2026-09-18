import { useMemo } from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import PropTypes from "prop-types";
import "./v.css";
import ShowCostInCardDiamond from "./showCostInCardDiamond";
import { utils } from "../Helpers";
import { useNavigate } from 'react-router-dom';
const V = ({
  className = "",
  propBorderRadius,
  propBorder,
  propBorderTop,
  propBorderRight,
  propBorderBottom,
  diamond,
  removeCompareDiamondIds,
  configAppData
}) => {
  const v1Style = useMemo(() => {
    return {
      borderRadius: propBorderRadius,
      border: propBorder,
      borderTop: propBorderTop,
      borderRight: propBorderRight,
      borderBottom: propBorderBottom,
    };
  }, [
    propBorderRadius,
    propBorder,
    propBorderTop,
    propBorderRight,
    propBorderBottom,
  ]);
  const navigate = useNavigate();
  const imageUrl = `${getImageBaseUrl()}`;
  const viewDiamond=(diamond)=>{
     const diamondDetailUrl= `${import.meta.env.VITE_DIAMOND_DETAIL_PAGE}`;
     const viewUrlLink = utils.getDiamondViewUrl(diamond)
    navigate("/"+diamondDetailUrl+"/"+viewUrlLink)
  }
  return (
    <div className={`v1 ${className}`} style={v1Style}>
      <div className="image10">
        <div className="frame-group">
          <div className="id-383212322-wrapper">
            <div className="id-3832123222">Id: {diamond.diamondId}</div>
          </div>
          <img onClick={()=>removeCompareDiamondIds([diamond.diamondId])}
            className="vector-icon15 remove-compared"
            loading="lazy"
            alt=""
            src={`${imageUrl}`+"/vector-31.svg"}
          />
        </div>
        <div className="image-9-wrapper">
          <img
            className="image-9-icon10"
            loading="lazy"
            alt={diamond.mainHeader}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              const fallback =
                diamond.image1 ||
                diamond.biggerDiamondimage ||
                diamond.defaultDiamondImage ||
                diamond.colorDiamond ||
                imageUrl + "/no-image.jpg";
              if (currentTarget.src !== fallback) {
                currentTarget.src = fallback;
              }
            }}
            src={diamond.image2 || diamond.image1 || diamond.biggerDiamondimage || diamond.defaultDiamondImage || diamond.colorDiamond}
          />
        </div>
      </div>
      <div className="frame-container">
        <div className="princess-1001-carath-parent">
          <h3 className="compared-title">{diamond.mainHeader}</h3>
          <b className="empty1"><ShowCostInCardDiamond diamondDetail={diamond} configAppData={configAppData}></ShowCostInCardDiamond></b>
        </div>
        <div className="button20" onClick={()=>viewDiamond(diamond)}>
          <img
            className="button-child"
            loading="lazy"
            alt=""
            src={`${imageUrl}`+"/vector-22.svg"}
          />
        </div>
      </div>
    </div>
  );
};

V.propTypes = {
  className: PropTypes.string,
  /** Style props */
  propBorderRadius: PropTypes.any,
  propBorder: PropTypes.any,
  propBorderTop: PropTypes.any,
  propBorderRight: PropTypes.any,
  propBorderBottom: PropTypes.any,
};

export default V;
