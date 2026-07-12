import PropTypes from "prop-types";
import "./fancy.css";

const Fancy = ({ className = "" }) => {
  return (
    <div className={`fancy ${className}`}>
      <img className="fancy-child" alt="" src="/polygon-7.svg" />
      <div className="also-known-as-fancy-color-diam-wrapper">
        <div className="also-known-as">
          Also known as fancy color diamonds, these are diamonds with colors
          that extend beyond GIA’s D-Z color grading scale. They fall all over
          the color spectrum, with a range of intensities and saturation. The
          most popular colors are pink and yellow.
        </div>
      </div>
    </div>
  );
};

Fancy.propTypes = {
  className: PropTypes.string,
};

export default Fancy;
