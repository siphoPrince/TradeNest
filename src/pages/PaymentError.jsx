import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, MessageCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import '../styles/PaymentError.css';

const PaymentError = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Get details from URL if passed (e.g., ?reason=insufficient_funds&orderId=123)
    const reason = searchParams.get('reason') || "The transaction could not be completed.";
    const orderId = searchParams.get('orderId');

    return (
        <div className="error-page-container">
            <div className="error-card">
                <div className="error-icon-wrapper">
                    <XCircle size={64} className="error-main-icon" />
                </div>

                <h1 className="error-title">Payment Unsuccessful</h1>
                <p className="error-message">{reason}</p>

                {orderId && (
                    <div className="order-ref-badge">
                        <AlertCircle size={14} />
                        <span>Reference: #ORD-{orderId}</span>
                    </div>
                )}

                <div className="error-info-box">
                    <p><strong>What happened?</strong></p>
                    <ul>
                        <li>Your bank might have declined the transaction.</li>
                        <li>The 3D Secure verification failed.</li>
                        <li>There might be a temporary connection issue.</li>
                    </ul>
                </div>

                <div className="error-actions">
                    <button 
                        className="btn-retry" 
                        onClick={() => navigate(-1)}
                    >
                        <RefreshCw size={18} /> Try Payment Again
                    </button>
                    
                    <button 
                        className="btn-support" 
                        onClick={() => navigate('/support')}
                    >
                        <MessageCircle size={18} /> Contact Support
                    </button>
                </div>

                <button 
                    className="btn-back-home" 
                    onClick={() => navigate('/dashboard')}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
            </div>
            
            <p className="security-note">
                Your payment security is our priority. No funds were deducted from your account.
            </p>
        </div>
    );
};

export default PaymentError;