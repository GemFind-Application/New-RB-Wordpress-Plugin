import { useCallback } from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "./component4.css";

const Component4 = ({ className = "" }) => {
  const navigate = useNavigate();
  const imageUrl = `${getImageBaseUrl()}`;
  const onContainerClick = useCallback(() => {
    navigate("/settings");
  }, [navigate]);

  return (
    <div className={`div93 step-items ${className}`} onClick={onContainerClick}>
      <div className="steps-details">
          <b className="step-12">Step 1</b>
          <b className="step-title">Choose Setting</b>
      </div>
      <div className="div57">
        <img className="image-10-icon" alt="" src={`${imageUrl}`+"/image-10@2x.png"} />
        <img className="image-9-icon11" alt="" src={`${imageUrl}`+"/image-9@2x.png"} />
        {<div className="div58">
          <img className="group-icon3" alt="" src={`${imageUrl}`+"/group1.svg"} />
        </div>}
      </div>
    </div>
  );
};

Component4.propTypes = {
  className: PropTypes.string,
};

export default Component4;
