import { useMemo } from "react";
import PropTypes from "prop-types";
import "./diamond-list-header.css";

const DiamondListHeader = ({ className = "", propWidth, propAlignSelf }) => {
  const diamondListHeader1Style = useMemo(() => {
    return {
      width: propWidth,
      alignSelf: propAlignSelf,
    };
  }, [propWidth, propAlignSelf]);

  return (
    <div
      className={`diamond-list-header1 ${className}`}
      style={diamondListHeader1Style}
    >
      <div className="div79">
        <div className="div80">
          <img className="image-icon5" alt="" src="/image@2x.png" />
          <div className="name3">
            <b className="princess-1001-carath4">Princess 10.01 CARATH</b>
            <b className="b26">$363,440</b>
          </div>
        </div>
        <div className="img1">
          <img className="union-icon1" alt="" src="/union.svg" />
          <b className="princess2">Princess</b>
        </div>
        <div className="cell6">
          <div className="div81">
            <b className="princess2">10.01</b>
            <div className="carat3">{`Carat `}</div>
          </div>
          <div className="div81">
            <b className="princess2">D</b>
            <div className="carat3">Color</div>
          </div>
        </div>
        <div className="cell6">
          <div className="div81">
            <b className="princess2">VVS1</b>
            <div className="carat3"> Clarity</div>
          </div>
          <div className="div81">
            <b className="princess2">Very good</b>
            <div className="carat3">Cut</div>
          </div>
        </div>
        <div className="cell6">
          <div className="div85">
            <b className="princess2">57%</b>
            <div className="table6">Table</div>
          </div>
          <div className="div85">
            <b className="princess2">62.4%</b>
            <div className="table6">Depth</div>
          </div>
        </div>
        <div className="cell6">
          <div className="div81">
            <b className="princess2">Very good</b>
            <div className="carat3"> Symmetry</div>
          </div>
          <div className="div81">
            <b className="princess2">Very good</b>
            <div className="carat3">{`Polish `}</div>
          </div>
        </div>
        <div className="cell10">
          <b className="text">{` `}</b>
        </div>
        <div className="cell6">
          <div className="div85">
            <b className="princess2">3.74X3.71X2.32</b>
            <div className="table6">Measurement</div>
          </div>
          <div className="div85">
            <b className="princess2">-</b>
            <div className="carat3">Intensity</div>
          </div>
        </div>
        <div className="actions6">
          <div className="actions7">
            <img className="video-icon1" alt="" src="/video.svg" />
          </div>
          <div className="actions8">
            <img className="compare-icon1" alt="" src="/compare.svg" />
          </div>
          <div className="button26">
            <img className="button-inner" alt="" src="/vector-2-3.svg" />
          </div>
        </div>
      </div>
    </div>
  );
};

DiamondListHeader.propTypes = {
  className: PropTypes.string,

  /** Style props */
  propWidth: PropTypes.any,
  propAlignSelf: PropTypes.any,
};

export default DiamondListHeader;
