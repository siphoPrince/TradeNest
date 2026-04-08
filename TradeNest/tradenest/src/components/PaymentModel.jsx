import React, { useState } from 'react';
import { X, ShieldCheck, Lock } from 'lucide-react';
import "../styles/PaymentModel.css";

const PaymentModal = ({ isOpen, onClose, productPrice, productName, postId, sellerId, onSetupRequired }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // --- ESCROW PAYMENT LOGIC ---
  const handlePayment = async () => {
    setIsProcessing(true);

    // 1. Get the current logged-in user (Buyer) from your Cylo Auth
    // Assuming you store the user object or ID in localStorage after login
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const buyerId = savedUser?.id || "user_1"; // Fallback to user_1 for testing

    try {
      // 2. Call your Node.js Payment Service (running on port 3001)
      const response = await fetch(`http://localhost:3001/api/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: buyerId,
          sellerId: sellerId || "user_2",
          amount: productPrice,
          itemDescription: productName,
          // Add these so TradeSafe knows where to send the user back to Cylo
          successUrl: "http://localhost:3000/payment-success",
          cancelUrl: "http://localhost:3000/buy-now/" + postId
        })
      });

      const data = await response.json();

      if (response.ok && data.paymentUrl) {
        // 3. SUCCESS: Redirect to TradeSafe's secure sandbox/checkout
        console.log("Redirecting to TradeSafe:", data.paymentUrl);
        window.location.href = data.paymentUrl; 
      } else {
        // 4. ERROR HANDLING
        if (response.status === 400) {
          // Trigger the SellerSetup view if users aren't onboarded
          onSetupRequired(data.error || "Account setup required before transacting.");
        } else {
          alert(data.error || "TradeSafe service is currently unavailable.");
        }
      }
    } catch (err) {
      console.error("Payment Service Error:", err);
      alert("Could not connect to Cylo Payments. Please ensure the Node server is running on port 3001.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="payment-modal">
        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        {/* Header */}
        <div className="modal-header">
          <ShieldCheck size={40} color="#22c55e" />
          <h2 style={{ color: 'var(--text-main)', marginTop: '10px' }}>
            Secure Escrow Payment
          </h2>
          <p className="subtitle">
            Your funds will be held safely by <strong>TradeSafe</strong> until you receive and inspect your item.
          </p>
        </div>

        {/* Order Summary */}
        <div className="order-summary-box">
          <div className="summary-item">
            <span>Product</span>
            <span className="value">{productName}</span>
          </div>
          <div className="summary-item">
            <span>Price</span>
            <span className="value">R{productPrice.toLocaleString()}</span>
          </div>
          <div className="summary-item total">
            <span>Total to Lock</span>
            <span className="value-total">R{productPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-note">
          <Lock size={14} />
          <span>Encrypted Handshake via TradeSafe API</span>
        </div>

        {/* Action Button */}
        <button 
          onClick={handlePayment} 
          className={`pay-btn ${isProcessing ? 'loading' : ''}`}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="loader-spinner">Securing Funds...</div>
          ) : (
            "Confirm & Pay"
          )}
        </button>

        <p className="footer-note">
          By clicking, you agree to the Cylo Escrow Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;