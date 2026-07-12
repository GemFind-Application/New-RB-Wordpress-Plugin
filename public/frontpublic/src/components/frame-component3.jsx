import PropTypes from "prop-types";
import "./frame-component3.css";

const FrameComponent3 = ({ className = "" }) => {
  return (
    <div className={`image-parent ${className}`}>
      <div className="image11">
        <img className="image-10-icon2" alt="" src="/image-92@2x.png" />
      </div>
      <div className="image-gallery1">
        <div className="gallery-items">
          <img className="gallery-items-child" alt="" src="/action-icon.svg" />
        </div>
        <img className="image-icon" alt="" src="/image@2x.png" />
        <img className="image-icon" alt="" src="/image@2x.png" />
        <img className="image-icon" alt="" src="/image@2x.png" />
        <img className="image-icon" alt="" src="/image@2x.png" />
        <div className="gallery-items">
          <img
            className="gallery-items-item"
            alt=""
            src="/gallery-separator.svg"
          />
        </div>
      </div>
      <div className="div61">
        <div className="note-content1">
          <div className="div62">
            <b className="note1">Note:</b>
            <div className="all-metal-color1">
              All metal color images may not be available.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

FrameComponent3.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent3;
