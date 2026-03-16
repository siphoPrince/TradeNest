import React, { useState } from 'react';
import { X, CheckCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import "../styles/PaymentModel.css"

const PaymentModal = ({ isOpen, onClose, productPrice, productName }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
        // Simulate C# API Call
        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsSuccess(true); // Switch to success view! 🎉
    } catch (error) {
        alert("Something went wrong with the payment.");
    } finally {
        setIsProcessing(false);
    }
  };

  const goToChat = () => {
    onClose();
    navigate('/inbox'); // Redirect to your messaging section
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="payment-modal">
        {/* Only show close button if not successful yet */}
        {!isSuccess && (
          <button className="close-btn" onClick={onClose}><X /></button>
        )}

        {!isSuccess ? (
          /* PAYMENT FORM VIEW */
          <>
            <h2 style={{ color: 'var(--text-main)' }}>Secure Escrow Payment 🔒</h2>
            <p className="subtitle">Funds held until you confirm the meetup.</p>

            <div className="order-summary">
              <span>{productName}</span>
              <strong>R{productPrice}</strong>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div className="input-group">
                <label>Cardholder Name</label>
                <input type="text" required placeholder="Name on Card" />
              </div>

              <div className="input-group">
                <label>Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" required />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Expiry Date</label>
                  <input type="text" placeholder="MM/YY" required />
                </div>
                <div className="input-group">
                  <label>CVV</label>
                  <input type="password" placeholder="123" required />
                </div>
              </div>

              <div className="total-section">
                <p>Total to be locked in Escrow:</p>
                <h3 className="final-price">R{productPrice}</h3>
              </div>

              <button 
                type="submit" 
                className={`pay-btn ${isProcessing ? 'loading' : ''}`}
                disabled={isProcessing}
              >
                {isProcessing ? "Verifying with Bank..." : "Confirm & Pay Now"}
              </button>
            </form>
          </>
        ) : (
          /* SUCCESS SCREEN VIEW */
          <div className="success-view" style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={80} color="#22c55e" style={{ marginBottom: '20px' }} />
            <h2 style={{ color: 'var(--text-main)' }}>Payment Secured!</h2>
            <p>R{productPrice} is now safe in Cylo Escrow. The seller has been notified.</p>
            
            <button className="pay-btn" onClick={goToChat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <MessageSquare size={20} />
              Message Seller to Meetup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;