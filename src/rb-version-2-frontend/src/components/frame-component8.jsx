import PropTypes from "prop-types";
import "./frame-component8.css";

const FrameComponent8 = ({ className = "", hintDropped }) => {
  return (
    <div className={`close-parent ${className}`}>
      <img className="close-icon8" loading="lazy" alt="" src="/close.svg" />
      <div className="hint-dropped-wrapper">
        <h1 className="hint-dropped">{hintDropped}</h1>
      </div>
    </div>
  );
};

FrameComponent8.propTypes = {
  className: PropTypes.string,
  hintDropped: PropTypes.string,
};

export default FrameComponent8;
