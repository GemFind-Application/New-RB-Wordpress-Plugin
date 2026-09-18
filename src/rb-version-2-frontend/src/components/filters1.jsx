import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "./filters1.css";

const Filters1 = ({ className = "" }) => {
  const navigate = useNavigate();

  const onGridContainerClick = useCallback(() => {
    navigate("/diamondtools");
  }, [navigate]);

  return (
    <div className={`filters2 ${className}`}>
      <div className="top9">
        <h3 className="diamonds-founded">126 Diamonds Founded</h3>
        <div className="sort">
          <div className="div44">
            <div className="search">
              <img className="search-icon" alt="" src="/vector-3.svg" />
              <input className="search1" placeholder="Search..." type="text" />
            </div>
            <div className="view">
              <div className="grid" onClick={onGridContainerClick}>
                <img
                  className="fi-11034222-icon"
                  loading="lazy"
                  alt=""
                  src="/fi-11034222.svg"
                />
                <a className="grid-view">Grid View</a>
              </div>
              <button className="table2">
                <img
                  className="fi-11034222-icon"
                  alt=""
                  src="/fi-14237153.svg"
                />
                <b className="table-view">Table View</b>
              </button>
            </div>
          </div>
          <div className="sort1">
            <div className="sort-by">Sort by:</div>
            <b className="clarity3">Clarity</b>
            <img
              className="sort-show-icons"
              alt=""
              src="/sort-show-icons.svg"
            />
          </div>
          <div className="show">
            <div className="show1">Show:</div>
            <b className="per-page">12 per Page</b>
            <img
              className="sort-show-icons"
              alt=""
              src="/sort-show-icons.svg"
            />
          </div>
        </div>
        <div className="comp">
          <a className="compare-diamonds">Compare Diamonds</a>
          <div className="empty-compare">
            <a className="a13">0</a>
          </div>
        </div>
      </div>
    </div>
  );
};

Filters1.propTypes = {
  className: PropTypes.string,
};

export default Filters1;
