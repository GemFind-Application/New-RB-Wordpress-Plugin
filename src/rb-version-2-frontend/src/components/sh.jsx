import PropTypes from "prop-types";
import "./sh.css";

const Sh = ({ className = "", price, cutOptions, colorOptions }) => {
  return (
    <div className={`sh4 ${className}`}>
      <div className="filter-headers">
        <div className="price7">{price}</div>
        <div className="empty-headers">
          <div className="empty-header-content">
            <b className="i2">i</b>
          </div>
        </div>
      </div>
      <div className="filter-options-rows">
        <div className="lab-certification">
          <img className="lab-certification-child" alt="" src="/line-1.svg" />
          <img className="lab-certification-item" alt="" src="/line-2.svg" />
        </div>
      </div>
      <div className="cut-filter">
        <div className="cut-options-content">
          <div className="cut-options-content-child" />
          <b className="cut-options">{cutOptions}</b>
        </div>
        <div className="color-filter">
          <div className="cut-options-content-child" />
          <b className="color-options">{colorOptions}</b>
        </div>
      </div>
    </div>
  );
};

Sh.propTypes = {
  className: PropTypes.string,
  price: PropTypes.string,
  cutOptions: PropTypes.string,
  colorOptions: PropTypes.string,
};

export default Sh;
