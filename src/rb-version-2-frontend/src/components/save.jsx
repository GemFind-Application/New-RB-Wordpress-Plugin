import PropTypes from "prop-types";
import "./save.css";

const Save = ({ className = "" }) => {
  return (
    <div className={`save ${className}`}>
      <a className="clear-all">Clear All</a>
    </div>
  );
};

Save.propTypes = {
  className: PropTypes.string,
};

export default Save;
