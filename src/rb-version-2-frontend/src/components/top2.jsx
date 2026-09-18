import PropTypes from "prop-types";
import "./top2.css";

const Top2 = ({ className = "" }) => {
  return (
    <div className={`top10 ${className}`}>
      <h3 className="setting-details3">Setting Details</h3>
      <div className="stats6">
        <div className="setting-row">
          <div className="setting-number1">Setting Number:</div>
          <b className="f1619-33-14kw-21">F1619-.33-14KW-2</b>
        </div>
        <div className="number-row">
          <div className="price8">Price:</div>
          <a className="a14">$485</a>
        </div>
        <div className="number-row">
          <div className="metal-type1">Metal Type:</div>
          <b className="white-gold1">White Gold</b>
        </div>
      </div>
      <div className="side">
        <b className="side-diamond-details">Side Diamond Details</b>
        <div className="stats7">
          <div className="number-row">
            <div className="number-of-diamonds">Number of Diamonds:</div>
            <b className="number-separator">1</b>
          </div>
          <div className="number-row">
            <div className="cut4">Cut:</div>
            <b className="round2">Round</b>
          </div>
          <div className="carat-row">
            <div className="number-of-diamonds">
              Minimum Carat Weight(ct.tw.):
            </div>
            <b className="carat-separator">0.5600</b>
          </div>
        </div>
      </div>
      <div className="side">
        <b className="side-diamond-details">Side Diamond Details</b>
        <div className="stats7">
          <div className="number-row">
            <div className="number-of-diamonds">Number of Diamonds:</div>
            <b className="number-separator">1</b>
          </div>
          <div className="number-row">
            <div className="cut4">Cut:</div>
            <b className="round2">Round</b>
          </div>
          <div className="carat-row">
            <div className="number-of-diamonds">
              Minimum Carat Weight(ct.tw.):
            </div>
            <b className="carat-separator">0.5600</b>
          </div>
        </div>
      </div>
    </div>
  );
};

Top2.propTypes = {
  className: PropTypes.string,
};

export default Top2;
