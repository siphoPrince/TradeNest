import React, { useState } from 'react';
import axios from 'axios';
import { X, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import "../styles/PaymentModel.css";

const PaymentModal = ({ isOpen, onClose, productPrice, productName, sellerId, onSetupRequired }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);

        // 1. Get IDs from your actual Auth storage
        // Ensure your login logic saves 'userId' to localStorage
        const buyerId = localStorage.getItem('userId');

        if (!buyerId) {
            alert("Please log in to continue.");
            setIsProcessing(false);
            return;
        }

        try {
            // 2. Call your C# Backend (ASP.NET Core)
            // The object keys match your TransactionRequestDto.cs exactly
            const response = await axios.post(`https://localhost:7124/api/Payments/create-transaction`, {
                buyerId: parseInt(buyerId),
                sellerId: parseInt(sellerId),
                amount: parseFloat(productPrice),
                itemDescription: productName
            });

            // 3. TradeSafe returns the checkout URL in the 'siteUrl' field
            // (Based on the TradeSafeService we built)
            const checkoutUrl = response.data.siteUrl;

            if (checkoutUrl) {
                console.log("Redirecting to secure payment...");
                window.location.href = checkoutUrl;
            } else {
                throw new Error("Payment URL not generated.");
            }

        } catch (err) {
            console.error("Payment Error:", err);
            
            // 4. Handle Unverified Users
            // If TradeSafe returns an error because a user isn't onboarded
            if (err.response?.status === 400 || err.response?.status === 404) {
                onSetupRequired(err.response?.data || "One of the parties is not verified.");
            } else {
                alert("Payment system is currently offline. Please try again later.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="payment-modal">
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="modal-header">
                    <div className="shield-icon">
                        <ShieldCheck size={32} color="#22c55e" />
                    </div>
                    <h2>Secure Checkout</h2>
                    <p className="subtitle">
                        Powered by <strong>TradeSafe Escrow</strong>
                    </p>
                </div>

                <div className="order-summary">
                    <div className="summary-row">
                        <span>Item</span>
                        <span className="bold">{productName}</span>
                    </div>
                    <div className="summary-row">
                        <span>Price</span>
                        <span className="bold">R{productPrice.toLocaleString()}</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total">
                        <span>Total to Escrow</span>
                        <span className="total-price">R{productPrice.toLocaleString()}</span>
                    </div>
                </div>

                <div className="security-badge">
                    <Lock size={12} />
                    <span>Your funds are protected until delivery</span>
                </div>

                <button 
                    onClick={handlePayment} 
                    className={`pay-confirm-btn ${isProcessing ? 'loading' : ''}`}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <div className="spinner-small">Generating Secure Link...</div>
                    ) : (
                        <>
                            <CreditCard size={18} />
                            Pay Securely
                        </>
                    )}
                </button>

                <p className="legal-footer">
                    Funds will be held by TradeSafe (Pty) Ltd. 
                    Release is triggered upon your confirmation of delivery.
                </p>
            </div>
        </div>
    );
};

export default PaymentModal;