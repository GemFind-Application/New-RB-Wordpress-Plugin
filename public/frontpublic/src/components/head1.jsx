import PropTypes from "prop-types";
import "./head1.css";

const Head1 = ({ className = "" }) => {
  return (
    <div className={`head4 ${className}`}>
      <img className="jewellery-icon3" alt="" src="/jewellery.svg" />
      <div className="menu-wrapper">
        <div className="menu2">
          <div className="menu-element20">Menu Element</div>
          <div className="menu-element20">Menu Element</div>
          <div className="menu-element20">Menu Element</div>
          <div className="menu-element20">Menu Element</div>
          <div className="menu-element20">Menu Element</div>
        </div>
      </div>
      <div className="head-inner1">
        <div className="frame-parent6">
          <div className="acc-frame">
            <img className="acc-icon3" alt="" src="/acc.svg" />
          </div>
          <div className="vector-parent5">
            <img className="vector-icon23" alt="" src="/vector.svg" />
            <div className="sub-slider">
              <b className="empty2">2</b>
            </div>
          </div>
          <div className="vector-parent5">
            <img className="vector-icon24" alt="" src="/vector-1.svg" />
            <div className="sub-slider">
              <b className="empty2">5</b>
            </div>
          </div>
          <div className="vector-parent5">
            <img className="vector-icon25" alt="" src="/vector-2.svg" />
            <div className="sub-slider">
              <b className="empty2">3</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Head1.propTypes = {
  className: PropTypes.string,
};

export default Head1;
