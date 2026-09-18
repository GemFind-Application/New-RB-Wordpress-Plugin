import { useMemo } from "react";
import PropTypes from "prop-types";
import "./shape.css";

const Shape = ({ className = "", group46, round, propWidth, propPadding }) => {
  const shapeStyle = useMemo(() => {
    return {
      width: propWidth,
      padding: propPadding,
    };
  }, [propWidth, propPadding]);

  return (
    <div className={`shape2 ${className}`} style={shapeStyle}>
      <div className="div45">
        <img className="child" loading="lazy" alt="" src={group46} />
      </div>
      <b className="round1">{round}</b>
    </div>
  );
};

Shape.propTypes = {
  className: PropTypes.string,
  group46: PropTypes.string,
  round: PropTypes.string,

  /** Style props */
  propWidth: PropTypes.any,
  propPadding: PropTypes.any,
};

export default Shape;
