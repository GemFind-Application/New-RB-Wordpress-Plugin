import React from 'react';
import { X } from 'lucide-react';
import './PopupAlert.css';

const PopupAlert = ({ content, onClose }) => {
  return (
    <div className="popup-overlay popupalert">
      <div className="popup-content">
        <button onClick={onClose} className="popup-close">
          <X size={20} />
        </button>
        <div className="popup-body gfrb-rich-text" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

export default PopupAlert;