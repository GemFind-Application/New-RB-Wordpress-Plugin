import React from "react";
import PortalPopup from "./portal-popup";
import { GfrbP } from "./scoped/GfrbText";
import "../pages/settings.css";

export default function CartSuccessModal({ onClose, productName, onContinueShopping, onGoToCart }) {
    return (
        <PortalPopup overlayColor="rgba(113, 113, 113, 0.3)">
            <div className="popup-overlay drop-hint-popup resetPopup">
                <div className="popup-content">
                    <button onClick={onClose} className="close-button">×</button>
                    <div className="success-message">
                        <h2>Added to Cart</h2>
                        <GfrbP className="text-left">
                            {productName} has been added to your cart.
                        </GfrbP>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button 
                                onClick={onContinueShopping}
                                className="button52_b"
                                style={{
                                    minWidth: '140px',
                                    padding: '12px 24px',
                                    height: 'auto'
                                }}
                            >
                                Continue Shopping
                            </button>
                            <button 
                                onClick={onGoToCart}
                                className="button52"
                                style={{
                                    minWidth: '140px',
                                    padding: '12px 24px',
                                    height: 'auto'
                                }}
                            >
                                Go to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PortalPopup>
    );
}
