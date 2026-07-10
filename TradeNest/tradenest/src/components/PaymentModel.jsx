import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import "../styles/PaymentModel.css";

const PaymentModal = ({ isOpen, onClose, productPrice, productName, sellerId, productId, onSetupRequired }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [localError, setLocalError] = useState("");

    // Reset error when modal closes/opens
    useEffect(() => {
        if (!isOpen) {
            setLocalError("");
        }
    }, [isOpen]);

    const handlePayment = async () => {
        setIsProcessing(true);
        setLocalError("");

        const buyerId = localStorage.getItem('userId');

        if (!buyerId) {
            setLocalError("Please log in to your account to continue.");
            setIsProcessing(false);
            return;
        }

        try {
            // 1. Post to C# API endpoint
            const response = await axios.post(`https://cylosocials.co.za/api/Payments/create-transaction`, {
                buyerId: parseInt(buyerId, 10),
                sellerId: parseInt(sellerId, 10),
                postId: parseInt(productId, 10),
                amount: parseFloat(productPrice),
                itemDescription: productName
            });

            // 2. Extract generated gateway link
            const checkoutUrl = response.data.checkoutUrl; 

            if (checkoutUrl) {
                console.log("Redirecting to secure gateway payment engine...");
                window.location.href = checkoutUrl;
            } else {
                throw new Error("Payment gateway failed to issue an transaction access link.");
            }

        } catch (err) {
            console.error("Payment Process Fault:", err);
            
            const errorMessage = err.response?.data?.message || "The payment system is currently offline. Please try again shortly.";

            if (err.response?.status === 400 || err.response?.status === 404) {
                // Route seller payout errors up to parent frame layout handler
                onSetupRequired(errorMessage); 
            } else {
                setLocalError(errorMessage);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            {/* stopPropagation prevents modal closing if clicking inner content panel card container */}
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose} aria-label="Close modal">
                    <X size={18} />
                </button>

                <div className="modal-header">
                    <div className="shield-icon">
                        <ShieldCheck size={32} />
                    </div>
                    <h2>Secure Checkout</h2>
                    <p className="subtitle">
                        Escrow Framework managed by <strong>TradeSafe</strong>
                    </p>
                </div>

                {localError && (
                    <div className="modal-error-alert">
                        <span>{localError}</span>
                    </div>
                )}

                <div className="order-summary">
                    <div className="summary-row">
                        <span className="label">Item</span>
                        <span className="value bold">{productName}</span>
                    </div>
                    <div className="summary-row">
                        <span className="label">Price</span>
                        <span className="value bold">R {productPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total">
                        <span className="label">Total to Escrow</span>
                        <span className="total-price">R {productPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div className="security-badge">
                    <Lock size={13} />
                    <span>Funds are held securely by TradeSafe until successful delivery</span>
                </div>

                <button 
                    onClick={handlePayment} 
                    className={`pay-confirm-btn ${isProcessing ? 'loading' : ''}`}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <div className="spinner-small">
                            <span className="loader-dot"></span> Generating Gateway Link...
                        </div>
                    ) : (
                        <>
                            <CreditCard size={18} />
                            <span>Confirm and Pay Securely</span>
                        </>
                    )}
                </button>

                <p className="legal-footer">
                    Funds will be safeguarded in accordance with TradeSafe (Pty) Ltd escrow terms. 
                    Payout release is authorized immediately following your verified confirmation of delivery.
                </p>
            </div>
        </div>
    );
};

export default PaymentModal;