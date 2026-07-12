import React, { createContext, useCallback, useContext, useState } from "react";
import ViewInFrontendBanner from "./ViewInFrontendBanner";
import { formatFrontendExperienceBadge, readToolVersionFromConfig } from "../utils/experienceBadge";

const AdminShellContext = createContext({
  setExperienceBadge: () => {},
});

export function useAdminShell() {
  return useContext(AdminShellContext);
}

function AdminHeader({ preferredSrc, fallbackSrc }) {
  const [src, setSrc] = useState(preferredSrc || fallbackSrc || "");

  const onError = () => {
    if (fallbackSrc && src !== fallbackSrc) {
      setSrc(fallbackSrc);
    }
  };

  return (
    <header className="wpdl-admin-header wpdl-admin-header--brand" role="banner">
      <div className="wpdl-admin-header__inner">
        {src ? (
          <img
            src={src}
            alt="GemFind Ring Builder"
            className="wpdl-admin-wordmark"
            width="1000"
            height="144"
            onError={onError}
          />
        ) : null}
        <div className="wpdl-admin-header__titles">
          <h1 className="wpdl-admin-heading">GemFind Ring Builder</h1>
        </div>
      </div>
    </header>
  );
}

export default function AdminShell({ children }) {
  const cfg = window.gemfindRBAdminConfig || {};
  const base = (cfg.pluginUrl || "").replace(/\/+$/, "");
  const preferredSrc = base ? `${base}/assets/images/wpdl/gemfind-diamondlink-logo.png` : "";
  const fallbackSrc = base ? `${base}/assets/images/wpdl2/gemfind-mark.svg` : "";

  const [experienceBadge, setExperienceBadgeState] = useState(() =>
    formatFrontendExperienceBadge(readToolVersionFromConfig(cfg))
  );

  const setExperienceBadge = useCallback((toolVersion) => {
    setExperienceBadgeState(formatFrontendExperienceBadge(toolVersion));
  }, []);

  return (
    <AdminShellContext.Provider value={{ setExperienceBadge }}>
      <div className="wpdl-admin-wrapper">
        <AdminHeader preferredSrc={preferredSrc} fallbackSrc={fallbackSrc} />
        <ViewInFrontendBanner frontendToolUrl={cfg.frontendToolUrl} experienceBadge={experienceBadge} />
        <div className="wpdl-admin-content wpdl-admin-content--card">{children}</div>
      </div>
    </AdminShellContext.Provider>
  );
}
