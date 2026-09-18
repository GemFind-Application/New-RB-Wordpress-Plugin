import PropTypes from "prop-types";
import "./sh2.css";

const Sh2 = ({ className = "", polish }) => {
  return (
    <div className={`sh6 ${className}`}>
      <div className="polish3">{polish}</div>
      <div className="from-to6">
        <div className="range78">
          <b className="txt78">Excellent</b>
        </div>
        <div className="range79">
          <div className="txt79">Very Good</div>
        </div>
        <div className="range79">
          <div className="txt80">Good</div>
        </div>
        <div className="range81">
          <div className="txt81">Fair</div>
        </div>
      </div>
    </div>
  );
};

Sh2.propTypes = {
  className: PropTypes.string,
  polish: PropTypes.string,
};

export default Sh2;
