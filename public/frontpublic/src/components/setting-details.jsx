import PropTypes from "prop-types";
import "./setting-details.css";

const SettingDetails = ({ className = "" }) => {
  return (
    <div className={`setting-details1 ${className}`}>
      <div className="content8">
        <div className="top8">
          <b className="setting-details2">Setting Details</b>
          <div className="stats3">
            <div className="attributes-table">
              <div className="setting-number">Setting Number:</div>
              <b className="f1619-33-14kw-2">F1619-.33-14KW-2</b>
            </div>
            <div className="attributes-table">
              <div className="price6">Price:</div>
              <b className="b10">$485</b>
            </div>
            <div className="attributes-table">
              <div className="metal-type">Metal Type:</div>
              <b className="white-gold">White Gold</b>
            </div>
          </div>
        </div>
        <div className="stats4">
          <div className="div34">
            <div className="can-be-set1">Can be set with:</div>
            <div className="filter-opened1">
              <img
                className="filter-opened-child2"
                alt=""
                src="/group-461@2x.png"
              />
              <img
                className="filter-opened-child3"
                alt=""
                src="/group-611.svg"
              />
              <img
                className="filter-opened-child4"
                alt=""
                src="/group-651.svg"
              />
              <img
                className="filter-opened-child4"
                alt=""
                src="/group-571.svg"
              />
              <img
                className="filter-opened-child6"
                alt=""
                src="/group-661.svg"
              />
              <div className="button8">
                <b className="apply-shapes-11">Apply Shapes (1)</b>
              </div>
            </div>
          </div>
        </div>
      </div>
      <img className="close-icon7" alt="" src="/close.svg" />
    </div>
  );
};

SettingDetails.propTypes = {
  className: PropTypes.string,
};

export default SettingDetails;
