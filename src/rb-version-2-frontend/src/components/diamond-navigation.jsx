import React, { useState, useCallback, useEffect } from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import { useNavigate } from "react-router-dom";
import Component4 from "./component4";
import Component from "./component";
import Component1 from "./component1";
import PropTypes from "prop-types";
import "./frame-component1.css";
import "./frame-component2.css";
import PopupAlert from "./PopupAlert";
const FrameComponent1 = ({
  className = "",
  diamondNavigation,
  setIsLabGrown,
  isLabGrown,
  configAppData,
}) => {
  const [popupContent, setPopupContent] = useState(null);
  const navigate = useNavigate();
  const [activePopup, setActivePopup] = useState(null);
  const onContainer2Click = useCallback(() => {
    navigate("/diamondtools/completering");
  }, []);
  const handleLabGrownToggle = (value) => {
    if (value === "Lab Grown") {
      setIsLabGrown(true);
    }
    if (value === "Mined") {
      setIsLabGrown(false);
    }
    if (value === "Fancy Color") {
      setIsLabGrown("fancy");
    }
  };
  // popup - use this for setting the content
  const handleInfoClick = (e, filterType) => {
    e.stopPropagation();
    const content = getPopupContent(filterType);
    setPopupContent(content);
  };
  const closePopup = () => {
    setPopupContent(null);
  };
  const togglePopup = (popup) => {
    setActivePopup(activePopup === popup ? null : popup);
  };
  const imageUrl = `${getImageBaseUrl()}`;
  const getPopupContent = (filterType) => {
    const contents = {
      mined:
        "Formed over billions of years, natural diamonds are mined from the earth. Diamonds are the hardest mineral on earth, which makes them an ideal material for daily wear over a lifetime. Our natural diamonds are conflict-free and GIA certified.",
      labgrown:
        "Lab-grown diamonds are created in a lab by replicating the high heat and high pressure environment that causes a natural diamond to form. They are compositionally identical to natural mined diamonds (hardness, density, light refraction, etc), and the two look exactly the same. A lab-grown diamond is an attractive alternative for those seeking a product with less environmental footprint.",
      fancy:
        "Also known as fancy color diamonds, these are diamonds with colors that extend beyond GIA’s D-Z color grading scale. They fall all over the color spectrum, with a range of intensities and saturation. The most popular colors are pink and yellow.",
    };
    return contents[filterType] || "Information not available.";
  };
  return (
    <div className={`diamondfilet-wrapper listtop_w ${className}`}>
      <div className="diamond-nav-container listtop_c">
        {/*<div className="home-group">
          <div className="home2">Home</div>
          <div className="home-buttons1">
            <img className="icons" alt="" src={`${imageUrl}`+"/vector-12.svg"} />
          </div>
          <div className="create-ring2">Create Ring</div>
          <div className="home-buttons1">
            <img className="icons" alt="" src={`${imageUrl}`+"/vector-23.svg" }/>
          </div>
          <b className="choose-diamond3">Choose Diamond</b>
        </div>*/}
        <div className="diamonds-group rb_listtop_w1">
          <div className="settings-panel rb_listtop_panel">
            <div className="h16 rb_setting_b">
              <b className="settings1 rb_setting_c">Diamonds</b>
              <b className="create-your-own3 rb_setting_heading">
              {configAppData.shop_title}
              </b>
              <div className="settings-desc rb_setting_desc">
                {configAppData.announcement_text}
              </div>
            </div>
            <div className="frame-wrapper1">
              <div className="group settings-steps">
                <Component4 />
                <Component />
                <Component1 onContainerClick1={onContainer2Click} />
              </div>
            </div>
          </div>
        </div>

        <div className="type1">
          {diamondNavigation.navStandard &&
            diamondNavigation.navStandard !== null && (
              <div
                className={isLabGrown === false ? "price18" : "price19"}
                onClick={() =>
                  handleLabGrownToggle(diamondNavigation.navStandard)
                }
              >
                <div className="mined1">{diamondNavigation.navStandard}</div>
                {configAppData.show_filter_info === "true" || configAppData.show_filter_info == 1 && (
                  <div className="empty-row">
                    <b
                      className="i10"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePopup("mined");
                        handleInfoClick(e, "mined");
                      }}
                    >
                      i
                    </b>
                  </div>
                )}
              </div>
            )}

          {diamondNavigation.navLabGrown &&
            diamondNavigation.navLabGrown !== null && (
              <div
                className={isLabGrown === true ? "price18" : "price19"}
                onClick={() =>
                  handleLabGrownToggle(diamondNavigation.navLabGrown)
                }
              >
                <div className="lab-growned1">
                  {diamondNavigation.navLabGrown}
                </div>
                {configAppData.show_filter_info === "true" || configAppData.show_filter_info == 1 && (
                  <div className="empty-row">
                    <b
                      className="i10"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePopup("labgrown");
                        handleInfoClick(e, "labgrown");
                      }}
                    >
                      i
                    </b>
                  </div>
                )}
              </div>
            )}

          {diamondNavigation.navFancyColored &&
            diamondNavigation.navFancyColored !== null && (
              <div
                className={isLabGrown === "fancy" ? "price18" : "price19"}
                onClick={() =>
                  handleLabGrownToggle(diamondNavigation.navFancyColored)
                }
              >
                <div className="fancy-colour1">
                  {diamondNavigation.navFancyColored}
                </div>
                {configAppData.show_filter_info === "true" || configAppData.show_filter_info == 1 && (
                  <div className="empty-row">
                    <b
                      className="i10"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePopup("fancy");
                        handleInfoClick(e, "fancy");
                      }}
                    >
                      i
                    </b>
                  </div>
                )}
              </div>
            )}
          {popupContent && (
            <PopupAlert content={popupContent} onClose={closePopup} />
          )}
        </div>
      </div>
    </div>
  );
};

FrameComponent1.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent1;
