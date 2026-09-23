import React from "react";
import "./activation-modal.css";

const ActivationModal = () => {
  return (
    <div className="activation-modal-overlay">
      <div className="activation-modal-content">
        <div className="activation-modal-body">
          <h2 className="gf_activationPopup_heading">Activation Required</h2>
          <p className="gf_activationPopup_desc">
            Please activate payment & subscribe to use the application.{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivationModal;

