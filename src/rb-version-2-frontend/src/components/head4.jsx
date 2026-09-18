import PropTypes from "prop-types";
import "./head4.css";

const Head4 = ({ className = "" }) => {
  return (
    <div className={`head2 ${className}`}>
      <img className="ico-icon" loading="lazy" alt="" src="/ico.svg" />
      <img className="frame-icon" loading="lazy" alt="" src="/frame.svg" />
      <img className="frame-icon1" loading="lazy" alt="" src="/frame-1.svg" />
      <div className="frame-parent1">
        <div className="compare-wrapper">
          <a className="compare1">Compare</a>
        </div>
        <div className="empty-item-parent">
          <div className="empty-item">
            <a className="no-items">2</a>
          </div>
          <div className="wishist-wrapper">
            <a className="wishist">Wishist</a>
          </div>
          <div className="empty-item">
            <a className="no-items">5</a>
          </div>
        </div>
      </div>
    </div>
  );
};

Head4.propTypes = {
  className: PropTypes.string,
};

export default Head4;
