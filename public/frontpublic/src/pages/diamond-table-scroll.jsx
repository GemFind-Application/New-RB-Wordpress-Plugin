import { useCallback } from "react";
import Head1 from "../components/head1";
import Filters1 from "../components/filters1";
import Shape from "../components/shape";
import Sh from "../components/sh";
import Sh1 from "../components/sh1";
import Sh2 from "../components/sh2";
import Sh3 from "../components/sh3";
import List2 from "../components/list2";
import { useNavigate } from "react-router-dom";
import "./diamond-table-scroll.css";

const DiamondTableScroll = () => {
  const navigate = useNavigate();

  const onRectangleHeaderClick = useCallback(() => {
    navigate("/diamond-table");
  }, [navigate]);

  return (
    <div className="diamond-table-scroll">
      <Head1 />
      <Filters1 />
      <main className="filter-content-wrapper">
        <section className="filter-content">
          <div className="filter-top">
            <div className="top">
              <div className="filters-wrapper">
                <h3 className="filters">Filters:</h3>
              </div>
              <div className="filter-buttons">
                <div className="button">
                  <img className="button-icons" alt="" src="/vector-4.svg" />
                </div>
                <div className="button1">
                  <img className="vector-icon" alt="" src="/vector-5.svg" />
                </div>
              </div>
            </div>
            <div className="filter-options">
              <div className="content">
                <div className="sh">
                  <div className="shape">Shape</div>
                  <div className="shape-info">
                    <b className="i">i</b>
                  </div>
                  <div className="div">
                    <Shape group46="/group-46@2x.png" round="Round" />
                    <Shape
                      group46="/group-59.svg"
                      round="Oval"
                      propWidth="69px"
                      propPadding="0px var(--padding-11xs)"
                    />
                    <Shape
                      group46="/group-64.svg"
                      round="Emerald"
                      propWidth="69px"
                      propPadding="0px var(--padding-11xs)"
                    />
                    <Shape
                      group46="/group-58.svg"
                      round="Radiant"
                      propWidth="69px"
                      propPadding="0px var(--padding-11xs)"
                    />
                    <Shape
                      group46="/group-60.svg"
                      round="Pear"
                      propWidth="69px"
                      propPadding="0px var(--padding-11xs)"
                    />
                    <Shape
                      group46="/group-61.svg"
                      round="Cushion"
                      propWidth="69px"
                      propPadding="0px var(--padding-11xs)"
                    />
                    <Shape
                      group46="/group-61-1.svg"
                      round="El.Cushion"
                      propWidth="unset"
                      propPadding="unset"
                    />
                    <Shape
                      group46="/group-62.svg"
                      round="El.Hexagon"
                      propWidth="unset"
                      propPadding="0px 0px"
                    />
                    <Shape
                      group46="/group-62-1.svg"
                      round="Marquise"
                      propWidth="69px"
                      propPadding="0px var(--padding-11xs)"
                    />
                    <Shape
                      group46="/group-65.svg"
                      round="Princess"
                      propWidth="69px"
                      propPadding="0px var(--padding-11xs)"
                    />
                    <Shape
                      group46="/group-57.svg"
                      round="Asscher"
                      propWidth="69px"
                      propPadding="0px var(--padding-11xs)"
                    />
                    <Shape
                      group46="/group-66.svg"
                      round="Heart"
                      propWidth="69px"
                      propPadding="0px var(--padding-11xs)"
                    />
                  </div>
                </div>
                <Sh price="Price" cutOptions="$ 0" colorOptions="$ 124,000" />
                <Sh price="Carat" cutOptions="0.30" colorOptions="10.00" />
                <div className="sh1">
                  <div className="cut">Cut</div>
                  <div className="div1">
                    <b className="i1">i</b>
                  </div>
                  <div className="from-to">
                    <div className="range">
                      <b className="txt">Ideal</b>
                    </div>
                    <div className="range">
                      <b className="txt1">Excellent</b>
                    </div>
                    <div className="range2">
                      <div className="txt2">Ideal</div>
                    </div>
                    <div className="range2">
                      <div className="txt3">Good</div>
                    </div>
                    <div className="range4">
                      <div className="txt4">Fair</div>
                    </div>
                  </div>
                </div>
                <Sh1
                  colour="Colour"
                  txt="D"
                  txt1="E"
                  txt2="F"
                  txt3="G"
                  txt4="H"
                  txt5="I"
                  txt6="J"
                  txt7="K"
                  txt8="L"
                  txt9="M"
                />
                <Sh1
                  colour="Clarity"
                  txt="FL"
                  txt1="IF"
                  txt2="VVS1"
                  txt3="VVS2"
                  txt4="VS1"
                  txt5="VS2"
                  txt6="SI1"
                  txt7="SI2"
                  txt8="SI3"
                  txt9="I1"
                />
                <div className="adv">
                  <b className="advanced-filters">Advanced Filters</b>
                  <div className="advanced-filter-icon-wrapper">
                    <img
                      className="advanced-filter-icon"
                      alt=""
                      src="/vector-2-2.svg"
                    />
                  </div>
                </div>
                <Sh2 polish="Polish" />
                <Sh3 depth="Depth" />
                <Sh3 depth="Table" />
                <div className="sh2">
                  <div className="fluorescence">{`Fluorescence `}</div>
                  <div className="from-to">
                    <div className="range">
                      <b className="txt5">None</b>
                    </div>
                    <div className="range2">
                      <div className="txt6">Faint</div>
                    </div>
                    <div className="range2">
                      <div className="txt7">Medium</div>
                    </div>
                    <div className="range2">
                      <div className="txt8">Strong</div>
                    </div>
                    <div className="range4">
                      <div className="txt9">Very Strong</div>
                    </div>
                  </div>
                </div>
                <Sh2 polish="Symmetry" />
                <div className="sh3">
                  <div className="certificates">Certificates</div>
                  <div className="list">
                    <div className="price">
                      <div className="ags">AGS</div>
                    </div>
                    <div className="price1">
                      <div className="egl">EGL</div>
                    </div>
                    <div className="price2">
                      <div className="ags">GIA</div>
                    </div>
                    <div className="price3">
                      <div className="igi">IGI</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bottom">
                <button className="button2">
                  <b className="apply-filters-8">Apply filters (8)</b>
                </button>
              </div>
            </div>
          </div>
          <List2 />
        </section>
      </main>
      <div className="pagination">
        <div className="res">
          <div className="results">Results</div>
          <b className="of-21">{`1-8 of 21 `}</b>
        </div>
        <div className="pages">
          <div className="gemfind-copyright-wrapper">
            <img
              className="gemfind-copyright-icon"
              alt=""
              src="/vector-2-11.svg"
            />
          </div>
          <div className="wrapper">
            <b className="b">1</b>
          </div>
          <div className="container">
            <div className="div2">2</div>
          </div>
          <div className="frame">
            <div className="div3">...</div>
          </div>
          <div className="container">
            <div className="div2">3</div>
          </div>
          <div className="wrapper1">
            <div className="div3">24</div>
          </div>
          <div className="gemfind-copyright-wrapper">
            <img className="instance-child" alt="" src="/vector-2-12.svg" />
          </div>
        </div>
      </div>
      <footer className="pagination1">
        <div className="gemfind-app-store">
          © 2024 GemFind App Store Powered by GemFind.
        </div>
      </footer>
      <header
        className="diamond-table-scroll-child"
        onClick={onRectangleHeaderClick}
      />
    </div>
  );
};

export default DiamondTableScroll;
