import Component4 from "./component4";
import Component from "./component";
import Component1 from "./component1";
import PropTypes from "prop-types";
import "./frame-component6.css";

const FrameComponent6 = ({ className = "" }) => {
  return (
    <div className={`navigation-items-wrapper ${className}`}>
      <div className="navigation-items">
        <div className="home-parent">
          <div className="home1">Home</div>
          <div className="home-elements">
            <img className="home-elements-child" alt="" src="/vector-12.svg" />
          </div>
          <div className="create-ring1">Create Ring</div>
          <div className="home-elements">
            <img className="home-elements-child" alt="" src="/vector-23.svg" />
          </div>
          <b className="choose-diamond1">Choose Diamond</b>
        </div>
        <div className="diamonds-parent">
          <b className="diamonds">Diamonds</b>
          <div className="frame-parent3">
            <div className="frame-parent4">
              <div className="create-your-own-ring-parent">
                <b className="create-your-own1">Create your own ring</b>
                <div className="lorem-nisl-fringilla1">
                  Lorem nisl fringilla magna malesuada egestas dui. Fringilla
                  fermentum fusce interdum nulla velit vestibulum. Pretium
                  iaculis id elementum commodo convallis. A rhoncus malesuada
                  orci aliquam ipsum quis praesent. Egestas molestie nec enim et
                  sem in orci.
                </div>
              </div>
              <div className="price-parent">
                <div className="price9">
                  <div className="mined">Mined</div>
                </div>
                <div className="price10">
                  <div className="lab-growned">Lab Growned</div>
                </div>
                <div className="price11">
                  <div className="fancy-colour">Fancy Colour</div>
                </div>
              </div>
            </div>
            <div className="frame-wrapper">
              <div className="step-items-parent">
                <Component4 />
                <Component />
                <Component1 />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

FrameComponent6.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent6;
