import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
            <CheckCircle size={80} color="#22c55e" style={{ marginBottom: '20px' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Payment Secured!</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Your funds are now held safely in **Cylo Escrow**. <br />
                The seller has been notified to ship your item.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="secondary-btn"
                >
                    Back to Feed
                </button>
                <button 
                    onClick={() => navigate('/my-orders')}
                    style={{ 
                        backgroundColor: '#000', 
                        color: '#fff', 
                        padding: '10px 20px', 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Package size={18} />
                    View My Orders
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;