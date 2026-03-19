import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import "../styles/PaymentModel.css";

const PaymentModal = ({ isOpen, onClose, productPrice, productName, postId, onSetupRequired }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`https://localhost:7124/api/Escrow/create/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          postId: postId,
          amount: productPrice
        })
      });

      // --- START OF FIXED LOGIC ---
      if (response.ok) {
        const data = await response.json();
        // Redirect to Paystack's secure checkout
        window.location.href = data.checkoutUrl; 
      } else {
        // 1. Check for 401 Unauthorized first (usually has no JSON body)
        if (response.status === 401) {
          alert("Your session has expired. Please log in again to Cylo.");
          setIsProcessing(false);
          return;
        }

        // 2. Check if the response actually contains JSON before parsing
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          
          if (response.status === 400) {
            // This triggers the SellerSetup view in BuyNow.jsx
            onSetupRequired(errorData.message || "Seller setup required");
          } else {
            alert(errorData.message || "Failed to start payment.");
          }
        } else {
          // Fallback for 500 or 404 errors with no JSON body
          alert(`Server error: ${response.status}. Please try again later.`);
        }
      }
      // --- END OF FIXED LOGIC ---

    } catch (err) {
      console.error("Network/Server Error:", err);
      alert("Could not reach the Cylo server. Check if your backend is running!");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="payment-modal">
        <button className="close-btn" onClick={onClose}><X /></button>

        <h2 style={{ color: 'var(--text-main)' }}>Secure Escrow Payment 🔒</h2>
        <p className="subtitle">You'll be redirected to Paystack to complete your payment.</p>

        <div className="order-summary">
          <span>{productName}</span>
          <strong>R{productPrice}</strong>
        </div>

        <div className="total-section">
          <p>Total to be locked in Escrow:</p>
          <h3 className="final-price">R{productPrice}</h3>
        </div>

        <button 
          onClick={handlePayment} // FIXED: Matched the name to handlePayment
          className={`pay-btn ${isProcessing ? 'loading' : ''}`}
          disabled={isProcessing}
        >
          {isProcessing ? "Connecting to Bank..." : "Proceed to Paystack"}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;