import React from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';

export default function CartSuccessModal({ 
    isOpen, 
    onClose, 
    productName, 
    onContinueShopping, 
    onGoToCart 
}) {
    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            closeOnOverlayClick={true}
            showCloseIcon={true}
            center
            classNames={{
                overlay: 'popup_Overlay',
                modal: 'popup-form-extra-small cart-success-modal',
            }}
            styles={{
                modal: {
                    background: '#ffffff',
                    padding: '30px',
                    maxWidth: '400px',
                    textAlign: 'center',
                },
            }}
        >
            <div className="cart-success-content">
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: '0 0 10px 0',
                    color: '#000',
                    fontFamily: 'inherit',
                }}>
                    Added to Cart
                </h2>
                <p style={{
                    fontSize: '14px',
                    margin: '0 0 20px 0',
                    color: '#000',
                    textAlign: 'left',
                }}>
                    {productName} has been added to your cart.
                </p>
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '20px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                }}>
                    <button
                        onClick={onContinueShopping}
                        className="btn btn-secondary"
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid var(--button, #000)',
                            color: 'var(--button, #000)',
                            padding: '12px 24px',
                            borderRadius: '0',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textTransform: 'capitalize',
                            minWidth: '140px',
                            transition: '0.3s',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'var(--hover, #92cddc)';
                            e.target.style.color = '#fff';
                            e.target.style.borderColor = 'var(--hover, #92cddc)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = 'var(--button, #000)';
                            e.target.style.borderColor = 'var(--button, #000)';
                        }}
                    >
                        Continue Shopping
                    </button>
                    <button
                        onClick={onGoToCart}
                        className="btn btn-primary"
                        style={{
                            backgroundColor: 'var(--button, #000)',
                            color: '#fff',
                            border: '1px solid var(--button, #000)',
                            padding: '12px 24px',
                            borderRadius: '0',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textTransform: 'capitalize',
                            minWidth: '140px',
                            transition: '0.3s',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'var(--hover, #92cddc)';
                            e.target.style.borderColor = 'var(--hover, #92cddc)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'var(--button, #000)';
                            e.target.style.borderColor = 'var(--button, #000)';
                        }}
                    >
                        Go to Cart
                    </button>
                </div>
            </div>
        </Modal>
    );
}
