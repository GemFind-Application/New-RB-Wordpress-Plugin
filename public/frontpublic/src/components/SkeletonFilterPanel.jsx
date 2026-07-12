import React from 'react';
import './SkeletonFilterPanel.css';

const SkeletonFilterPanel = () => {
  return (
    <div className="SettingsFilterPanel">
      {/*<div className="settingsfilter-wrapper">
        <div className="mined-lab-wrapper">
          <div className="mined-settings">
            <div className="mined2 skeleton-box"></div>
            <div className="separator"><b className="i22">i</b></div>
          </div>
          <div className="lab-settings">
            <div className="lab-growned2 skeleton-box"></div>
            <div className="separator"><b className="i22">i</b></div>
          </div>
        </div>
      </div>*/}
      <div className="list-header">
        <div className="settingfilter-top">
          <b className="settings-founded skeleton-line"></b>
          <div className="settings-sort">
            <div className="settings-sort-page">
              <div className="sort-by4 skeleton-line"></div>
              <div className="skeleton-box"></div>
            </div>
            <div className="settings-sort-page">
              <div className="show7 skeleton-line"></div>
              <div className="skeleton-box"></div>
            </div>
          </div>
        </div>
        <div className="filters-setting">
          <div className="mid2">
            <div className="filters9">
              <div className="filters-wrapper1">
                <div className="filters-label skeleton-line"></div>
              </div>
              <div className="filter-container">
                {Array(4).fill().map((_, index) => (
                  <div key={index} className="filter-dropdown">
                    <div className="filter-button skeleton-box"></div>
                  </div>
                ))}
              </div>
              <div className="actions13">
                <div className="button30 skeleton-box"></div>
                <div className="button31 skeleton-box"></div>
              </div>
            </div>
            <div className="search6">
              <div className="gf-search-input skeleton-box"></div>
              <div className="search7 skeleton-box"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonFilterPanel;
