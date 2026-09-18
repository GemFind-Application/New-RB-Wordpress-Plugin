import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "./frame-component7.css";

const FrameComponent7 = ({ className = "" }) => {
  const navigate = useNavigate();

  const onGridContainerClick = useCallback(() => {
    navigate("/diamondtools");
  }, [navigate]);

  return (
    <div className={`diamond-table-inner ${className}`}>
      <div className="frame-parent5">
        <div className="top-parent">
          <div className="top13">
            <b className="diamonds-founded1">126 Diamonds Founded</b>
            <div className="sort4">
              <div className="sort5">
                <div className="sort-by2">Sort by:</div>
                <b className="clarity5">Clarity</b>
                <img className="sort-child" alt="" src="/sort-show-icons.svg" />
              </div>
              <div className="show2">
                <div className="show3">Show:</div>
                <b className="per-page1">12 per Page</b>
                <img className="sort-child" alt="" src="/sort-show-icons.svg" />
              </div>
            </div>
            <div className="comp1">
              <div className="compare-diamonds2">Compare Diamonds</div>
              <div className="compare-placeholder">
                <b className="b24">0</b>
              </div>
            </div>
          </div>
          <div className="filters-stone">
            <div className="mid">
              <div className="filters3">
                <div className="filters-container">
                  <div className="filters4">Filters:</div>
                </div>
                <div className="filters5">
                  <div className="price12">
                    <div className="shape-filter">
                      <img
                        className="vector-icon19"
                        alt=""
                        src="/vector2.svg"
                      />
                      <div className="shape4">Shape</div>
                    </div>
                    <img className="sort-child" alt="" src="/vector-21.svg" />
                    <div className="cut-placeholder">
                      <b className="b25">1</b>
                    </div>
                    <div className="info-icon2">
                      <b className="i4">i</b>
                    </div>
                  </div>
                  <div className="price13">
                    <div className="price14">Price</div>
                    <img className="sort-child" alt="" src="/vector-21.svg" />
                    <div className="info-icons">
                      <b className="i4">i</b>
                    </div>
                  </div>
                  <div className="price15">
                    <div className="carat1">Carat</div>
                    <img className="sort-child" alt="" src="/vector-21.svg" />
                    <div className="div75">
                      <b className="i4">i</b>
                    </div>
                  </div>
                  <div className="metal">
                    <div className="cut-filter1">
                      <div className="cut7">Cut</div>
                    </div>
                    <img className="sort-child" alt="" src="/vector-21.svg" />
                    <div className="info-icons">
                      <b className="i4">i</b>
                    </div>
                  </div>
                  <div className="price16">
                    <div className="filters4">Color</div>
                    <img className="sort-child" alt="" src="/vector-21.svg" />
                    <div className="div75">
                      <b className="i4">i</b>
                    </div>
                  </div>
                  <div className="price17">
                    <div className="clarity6">Clarity</div>
                    <img className="sort-child" alt="" src="/vector-21.svg" />
                    <div className="info-icons">
                      <b className="i4">i</b>
                    </div>
                  </div>
                </div>
                <div className="actions2">
                  <div className="actions-inner">
                    <div className="frame-child3" />
                  </div>
                  <div className="buttons2">
                    <div className="button23">
                      <img
                        className="vector-icon20"
                        alt=""
                        src="/vector-4.svg"
                      />
                    </div>
                    <div className="button24">
                      <img
                        className="vector-icon21"
                        alt=""
                        src="/vector-5.svg"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="div78">
                <div className="search2">
                  <img className="vector-icon22" alt="" src="/vector-3.svg" />
                  <div className="search3">Search...</div>
                </div>
                <div className="view2">
                  <div className="grid2" onClick={onGridContainerClick}>
                    <img
                      className="fi-11034222-icon1"
                      alt=""
                      src="/fi-11034222.svg"
                    />
                    <div className="grid-view1">Grid View</div>
                  </div>
                  <div className="table4">
                    <img
                      className="fi-11034222-icon1"
                      alt=""
                      src="/fi-14237153.svg"
                    />
                    <b className="table-view1">Table View</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="advances">
          <div className="adv1">
            <b className="advanced-filters1">Advanced Filters</b>
            <div className="adv-inner">
              <img className="frame-child4" alt="" src="/vector-24.svg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

FrameComponent7.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent7;
