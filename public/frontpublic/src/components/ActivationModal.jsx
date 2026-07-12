import React from "react";
import PortalPopup from "./portal-popup";
import { GfrbP } from "./scoped/GfrbText";
import "../pages/settings.css";

export default function ActivationModal() {
  return (
    <PortalPopup overlayColor="rgba(113, 113, 113, 0.3)">
      <div className="popup-overlay drop-hint-popup resetPopup">
        <div className="popup-content">
          <div className="success-message">
            <h2 className="gf_activationPopup_heading">Activation Required</h2>
            <GfrbP className="gf_activationPopup_desc">
              Please activate payment & subscribe to use the application.{" "}
            </GfrbP>
          </div>
        </div>
      </div>
    </PortalPopup>
  );
}

