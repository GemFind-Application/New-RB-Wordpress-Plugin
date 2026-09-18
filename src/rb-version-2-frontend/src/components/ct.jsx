import PropTypes from "prop-types";
import "./ct.css";

const Ct = ({ className = "" }) => {
  return (
    <div className={`ct ${className}`}>
      <div className="div31">0.36-0.76</div>
    </div>
  );
};

Ct.propTypes = {
  className: PropTypes.string,
};

export default Ct;
