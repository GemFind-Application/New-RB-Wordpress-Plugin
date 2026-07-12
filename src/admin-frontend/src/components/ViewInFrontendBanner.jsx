import React from "react";

export default function ViewInFrontendBanner({ frontendToolUrl, experienceBadge }) {
  const url = frontendToolUrl || "/";
  const badge = experienceBadge || "v2.0";

  return (
    <div className="wpdl-view-frontend-banner" role="region" aria-label="Storefront link">
      <div className="wpdl-view-frontend-banner__inner">
        <div className="wpdl-view-frontend-banner__copy">
          <p className="wpdl-view-frontend-banner__message">
            To view your store in frontend please click on &lsquo;View In Frontend&rsquo; button.
          </p>
          <p className="wpdl-view-frontend-banner__version">
            Current Version: <span className="wpdl-view-frontend-banner__version-tag">{badge}</span>
          </p>
        </div>
        <a
          className="wpdl-view-frontend-banner__btn"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View In Frontend
        </a>
      </div>
    </div>
  );
}
