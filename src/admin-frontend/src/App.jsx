import React, { useState } from "react";
import SettingsPage from "./pages/SettingsPage";
import CssPage from "./pages/CssPage";
import RegistrationPage from "./pages/RegistrationPage";

const PAGES = {
  settings: SettingsPage,
  css: CssPage,
};

export default function App() {
  const mount = document.getElementById("gemfindrb-admin-root");
  const page = mount?.dataset?.page || "settings";
  const cfg = window.gemfindRBAdminConfig || {};
  const requireRegistration = cfg.requireRegistration !== false;
  const [registered, setRegistered] = useState(!!cfg.customerRegistered);

  if (requireRegistration && !registered && page !== "registration") {
    return (
      <div className="gemfind-ring-builder-scope gemfindrb-admin-app">
        <RegistrationPage onComplete={() => setRegistered(true)} />
      </div>
    );
  }

  const Page = PAGES[page] || SettingsPage;
  return (
    <div className="gemfind-ring-builder-scope gemfindrb-admin-app">
      <Page />
    </div>
  );
}
