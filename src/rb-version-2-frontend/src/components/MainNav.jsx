import PropTypes from "prop-types";
import "./head3.css";

const Head3 = ({ className = "" }) => {
  return (
    <div className={`main-navigation ${className}`}>
      <img className="jewellery-icon4" alt="" src="/jewellery.svg" />
      <div className="menu3">
        <div className="menu-element25">Menu Element</div>
        <div className="menu-element25">Menu Element</div>
        <div className="menu-element25">Menu Element</div>
        <div className="menu-element25">Menu Element</div>
        <div className="menu-element25">Menu Element</div>
      </div>
      <img className="frame-icon2" alt="" src="/frame.svg" />
      <img className="frame-icon3" alt="" src="/frame-1.svg" />
      <img className="frame-icon4" alt="" src="/frame1.svg" />
      <div className="single-item-submenu-parent">
        <div className="single-item-submenu">
          <img className="acc-icon4" alt="" src="/acc.svg" />
        </div>
        <div className="div104">
          <b className="b33">2</b>
        </div>
        <div className="div104">
          <b className="b33">5</b>
        </div>
        <div className="div104">
          <b className="b33">3</b>
        </div>
      </div>
    </div>
  );
};

Head3.propTypes = {
  className: PropTypes.string,
};

export default Head3;
