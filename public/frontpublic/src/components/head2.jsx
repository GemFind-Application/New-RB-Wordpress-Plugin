import PropTypes from "prop-types";
import "./head2.css";

const Head2 = ({ className = "" }) => {
  return (
    <div className={`head3 ${className}`}>
      <img className="jewellery-icon2" alt="" src="/jewellery.svg" />
      <div className="head-inner">
        <div className="menu-element-parent">
          <div className="menu-element15">Menu Element</div>
          <div className="menu-element15">Menu Element</div>
          <div className="menu-element15">Menu Element</div>
          <div className="menu-element15">Menu Element</div>
          <div className="menu-element15">Menu Element</div>
        </div>
      </div>
      <div className="head-child">
        <div className="frame-parent2">
          <div className="acc-container">
            <img className="acc-icon2" alt="" src="/acc.svg" />
          </div>
          <div className="vector-parent2">
            <img className="vector-icon16" alt="" src="/vector.svg" />
            <div className="div54">
              <b className="b17">2</b>
            </div>
          </div>
          <div className="vector-parent2">
            <img className="vector-icon17" alt="" src="/vector-1.svg" />
            <div className="div54">
              <b className="b17">5</b>
            </div>
          </div>
          <div className="vector-parent2">
            <img className="vector-icon18" alt="" src="/vector-2.svg" />
            <div className="div54">
              <b className="b17">3</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Head2.propTypes = {
  className: PropTypes.string,
};

export default Head2;
