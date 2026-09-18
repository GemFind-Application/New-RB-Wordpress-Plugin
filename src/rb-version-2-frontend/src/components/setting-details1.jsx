import Top2 from "./top2";
import PropTypes from "prop-types";
import "./setting-details1.css";

const SettingDetails1 = ({ className = "", product }) => {
  return (
    <div className={`setting-details ${className}`}>
      <section className="content6">
        <Top2 />
        <div className="stats1">
          <div className="filter-content1">
            <div className="can-be-set">Can be set with:</div>
            <div className="filter-opened">
              {product.extraImage && product.extraImage.length > 0 && (
                <img
                  className="filter-opened-child"
                  loading="lazy"
                  alt=""
                  src={product.extraImage[0]}
                />
              )}
              {product.extraImage && product.extraImage.length > 1 && (
                <img
                  className="filter-opened-item"
                  loading="lazy"
                  alt=""
                  src={product.extraImage[1]}
                />
              )}
              {product.extraImage && product.extraImage.length > 2 && (
                <img
                  className="filter-opened-inner"
                  loading="lazy"
                  alt=""
                  src={product.extraImage[2]}
                />
              )}
              {product.extraImage && product.extraImage.length > 3 && (
                <img
                  className="filter-opened-inner"
                  loading="lazy"
                  alt=""
                  src={product.extraImage[3]}
                />
              )}
              <div className="button7">
                <b className="apply-shapes-1">Apply Shapes (1)</b>
              </div>
            </div>
          </div>
        </div>
      </section>
      <img className="close-icon5" loading="lazy" alt="" src="/close.svg" />
    </div>
  );
};

SettingDetails1.propTypes = {
  className: PropTypes.string,
  product: PropTypes.object.isRequired,
};

export default SettingDetails1;