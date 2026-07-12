import PropTypes from "prop-types";
import "./diamond-details.css";

const DiamondDetails = ({ className = "" }) => {
  return (
    <div className={`diamond-details2 ${className}`}>
      <section className="content7">
        <div className="top7">
          <h3 className="diamond-details3">Diamond Details</h3>
          <div className="stats2">
            <div className="attributes-header">
              <div className="stock-number1">Stock Number:</div>
              <a className="attribute-value">387952732</a>
            </div>
            <div className="attributes-header1">
              <div className="price5">Price:</div>
              <b className="b6">$363,440</b>
            </div>
            <div className="attributes-header1">
              <a className="price-per-carat1">Price Per Carat:</a>
              <a className="a7">$1,990</a>
            </div>
            <div className="attributes-header1">
              <div className="carat-weight1">Carat Weight:</div>
              <b className="b7">0,30</b>
            </div>
            <div className="attributes-header1">
              <div className="cut2">Cut:</div>
              <a className="excellent2">Excellent</a>
            </div>
            <div className="attributes-header1">
              <div className="color1">Color:</div>
              <b className="e1">E</b>
            </div>
            <div className="attributes-header1">
              <div className="clarity1">Clarity:</div>
              <b className="i12">I1</b>
            </div>
            <div className="attributes-header1">
              <div className="polish1">Polish:</div>
              <b className="very-good1">Very good</b>
            </div>
            <div className="attributes-header1">
              <div className="symmetry1">Symmetry:</div>
              <b className="excellent3">Excellent</b>
            </div>
            <div className="attributes-header1">
              <div className="girdle1">Girdle:</div>
              <b className="b8">-</b>
            </div>
            <div className="attributes-header1">
              <div className="color1">Culet:</div>
              <b className="none2">None</b>
            </div>
            <div className="attributes-header1">
              <div className="fluorescence2">Fluorescence:</div>
              <b className="none2">None</b>
            </div>
          </div>
        </div>
        <div className="number1">
          <div className="measurement-header">
            <img
              className="fi-8467779-icon1"
              loading="lazy"
              alt=""
              src="/fi-8467779.svg"
            />
            <div className="dimensions">
              <b className="length-width">62.4%</b>
              <div className="depth1">Depth</div>
            </div>
          </div>
          <div className="measurement-header1">
            <img
              className="fi-8467779-icon1"
              loading="lazy"
              alt=""
              src="/fi-12791189.svg"
            />
            <div className="dimensions">
              <b className="b9">57%</b>
              <div className="table1">Table</div>
            </div>
          </div>
          <div className="measurement-header2">
            <img
              className="fi-8467779-icon1"
              loading="lazy"
              alt=""
              src="/fi-8052211.svg"
            />
            <div className="dimensions">
              <b className="x371x2321">3.74X3.71X2.32</b>
              <div className="measurement1">Measurement</div>
            </div>
          </div>
        </div>
      </section>
      <img className="close-icon6" loading="lazy" alt="" src="/close.svg" />
    </div>
  );
};

DiamondDetails.propTypes = {
  className: PropTypes.string,
};

export default DiamondDetails;
