import PropTypes from "prop-types";
import "./sh3.css";

const Sh3 = ({ className = "", depth }) => {
  return (
    <div className={`sh7 ${className}`}>
      <div className="depth2">{depth}</div>
      <div className="vector-parent1">
        <img className="frame-item" alt="" src="/line-1.svg" />
        <img className="frame-inner" alt="" src="/line-2.svg" />
      </div>
      <div className="parent">
        <div className="div47">
          <div className="item" />
          <b className="b13">0%</b>
        </div>
        <div className="div48">
          <div className="item" />
          <b className="b14">100%</b>
        </div>
      </div>
    </div>
  );
};

Sh3.propTypes = {
  className: PropTypes.string,
  depth: PropTypes.string,
};

export default Sh3;
