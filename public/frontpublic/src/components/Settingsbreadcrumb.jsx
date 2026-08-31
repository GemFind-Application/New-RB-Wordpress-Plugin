import React, { useState, useCallback, useEffect } from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import { useNavigate } from "react-router-dom";
import StepItems from "./step-items";
import PropTypes from "prop-types";
import PopupAlert from "./PopupAlert";
import "./settingsbreadcrumb.css";

const Settingsbreadcrumb = ({ settingNavigation, className = "", configAppData, isLabGrown, setIsLabGrown }) => {
  const [popupContent, setPopupContent] = useState(null);
  const navigate = useNavigate();
  const imageUrl = `${getImageBaseUrl()}`;

  useEffect(() => {
    // console.log("Settingsbreadcrumb mounted");
    // console.log("configAppData:", configAppData);
    // console.log("isLabGrown:", isLabGrown);
  }, [configAppData, isLabGrown]);

  const onStepItemsContainer1Click = useCallback(() => {
    navigate("/diamondtools");
  }, [navigate]);

  const handleLabGrownToggle = (value) => {
    // console.log("handleLabGrownToggle called with value:", value);
    setIsLabGrown(value);
  };

  // popup content for lab and mined
  const getPopupContent = (filterType) => {
    const contents = {
      mined: "<p>Formed over billions of years, natural diamonds are mined from the earth. Diamonds are the hardest mineral on earth, which makes them an ideal material for daily wear over a lifetime. Our natural diamonds are conflict-free and GIA certified.</p>",
      labgrown: "<p>Lab-grown diamonds are created in a lab by replicating the high heat and high pressure environment that causes a natural diamond to form. They are compositionally identical to natural mined diamonds (hardness, density, light refraction, etc), and the two look exactly the same. A lab-grown diamond is an attractive alternative for those seeking a product with less environmental footprint.</p>",
    };
    return contents[filterType] || "Information not available.";
  };

  const handleInfoClick = (filterType) => {
    // console.log(`Show info for ${filterType}`);
    const content = getPopupContent(filterType);
    setPopupContent(content);
  };

  const closePopup = () => {
    setPopupContent(null);
  };
  //console.log()
  // Debugging
  // console.log("Rendering Settingsbreadcrumb");
  // console.log("navStandard:", configAppData.navStandard);
  // console.log("navLabGrown:", configAppData.navLabGrown);

  return (
    <div className={`settingsfilter-wrapper listtop_w ${className}`}>
      <div className="settingsfilter-container listtop_c">
        {/*<div className="settings-breadcrumb">
          <div className="home3">Home</div>
          <img className="bread-child" alt="" src={`${imageUrl}/vector-12.svg`} />
          <div className="create-ring3">Create Ring</div>
          <img className="bread-child" alt="" src={`${imageUrl}/vector-23.svg`} />
          <b className="choose-setting2">Choose Setting</b>
        </div>*/}
        <div className="settings-panel-wrapper rb_listtop_w1">
          <div className="settings-panel rb_listtop_panel">
            <div className="h16 rb_setting_b">
              <b className="settings1 rb_setting_c">SETTINGS</b>
              <b className="create-your-own3 rb_setting_heading"> {configAppData.shop_title}</b>
              <div className="settings-desc rb_setting_desc">
                {configAppData.announcement_text}
              </div>
            </div>
            <div className="settings-steps">
              <div className="step-items1 step-items">
                <div className="steps-details">
                  <b className="step-12">Step 1</b>
                  <b className="step-title">Choose Setting</b>
                </div>
                <div className="div109 div1024_ring">
                  <img
                    className="image-9-icon14"
                    alt=""
                    src={`${imageUrl}/image-9-2x.png`}
                  />
                  <img className="frame-icon5" alt="" src={`${imageUrl}/frame2.svg`} />
                </div>
              </div>
              <StepItems
                step2="Step 2"
                chooseDiamond="Choose Diamond"
                prop="/03.svg"
                onStepItemsContainerClick={onStepItemsContainer1Click}
              />
              <StepItems
                step2="Step 3"
                chooseDiamond="Complete Ring"
                prop="/02.svg"
              />
            </div>
          </div>
        </div>
        <div className="mined-lab-wrapper">
          {settingNavigation.navMinedSetting && (
            <div
              className={`mined-settings ${!isLabGrown ? 'active' : ''}`}
              onClick={() => handleLabGrownToggle(false)}
            >
              <div className="mined2">{settingNavigation.navMinedSetting}</div>
              {configAppData.show_filter_info === "true" || configAppData.show_filter_info == 1 && (
                <div className="separator">
                  <b
                    className="i22"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInfoClick('mined');
                    }}
                  >
                    i
                  </b>
                </div>
              )}
            </div>
          )}
          {settingNavigation.navLabSetting && (
            <div
              className={`lab-settings ${isLabGrown ? 'active' : ''}`}
              onClick={() => handleLabGrownToggle(true)}
            >
              <div className="lab-growned2">{settingNavigation.navLabSetting}</div>
              {configAppData.show_filter_info === "true" || configAppData.show_filter_info == 1 && (
                <div className="separator">
                  <b
                    className="i22"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInfoClick('labgrown');
                    }}
                  >
                    i
                  </b>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {popupContent && (
        <PopupAlert content={popupContent} onClose={closePopup} />
      )}
    </div>
  );
};

Settingsbreadcrumb.propTypes = {
  className: PropTypes.string,
  configAppData: PropTypes.shape({
    announcement_text: PropTypes.string,
    navStandard: PropTypes.string,
    navLabGrown: PropTypes.string,
    show_filter_info: PropTypes.string,
    imageUrl: PropTypes.string,
  }).isRequired,
  isLabGrown: PropTypes.bool.isRequired,
  setIsLabGrown: PropTypes.func.isRequired,
};

export default Settingsbreadcrumb;