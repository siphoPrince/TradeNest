import React, { useState } from 'react';
import { X } from 'lucide-react';
import "../styles/PaymentModel.css";

const PaymentModal = ({ isOpen, onClose, productPrice, productName, postId }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const token = localStorage.getItem("token"); // 🔑 Get your JWT

    try {
      const response = await fetch("https://localhost:7124/api/Escrow/create", {
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

      if (response.ok) {
        const data = await response.json();
        // Send user to Paystack's secure checkout site 🌐
        window.location.href = data.checkoutUrl; 
      } else {
        const error = await response.json();
        alert(error.message || "Failed to start payment.");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Could not reach the server.");
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
          onClick={handlePaymentSubmit}
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