import React, { useState, useEffect } from 'react';
import "../styles/PaymentHistory.css";
import Navigation from "../components/Navigation";
import { DollarSign, Clock, CheckCircle, ArrowDownCircle, AlertCircle, ExternalLink } from 'lucide-react';

const PaymentHistory = ({ userId, token }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Replace with your live Azure URL when you deploy
    const API_BASE_URL = "https://localhost:7124/api/payments";

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/my-orders/${userId}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : "",
                        'Cache-Control': 'no-cache',
                    }
                });

                if (!response.ok) throw new Error("Failed to fetch transaction history");

                const data = await response.json();
                setTransactions(data);
                setLoading(false);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        if (userId) fetchPayments();
    }, [userId, token]);

    // HANDLER: Release Funds (Buyer confirms they have the item)
    const handleReleaseFunds = async (orderId) => {
        if (!window.confirm("Are you sure? Only confirm if you have the item in hand and are happy with it.")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/release-funds/${orderId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert("Payment released! The seller will receive their funds shortly.");
                window.location.reload(); // Refresh to update status
            }
        } catch (err) {
            alert("Error releasing funds. Please try again.");
        }
    };

    // Dynamic Stats Logic
    const totalAvailable = transactions
        .filter(tx => tx.sellerId === userId && (tx.status === 'RELEASED' || tx.status === 'COMPLETED'))
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalPending = transactions
        .filter(tx => tx.status !== 'RELEASED' && tx.status !== 'COMPLETED' && tx.status !== 'CANCELLED')
        .reduce((sum, tx) => sum + tx.amount, 0);

    if (loading) return <div className="loader-overlay">Updating Cylo Ledger...</div>;

    return (
        <div className="profile-layout">
           
            <div className="dashboard-section">
                <header className="dashboard-header">
                    <div>
                        <h3>Payment History</h3>
                        <p className="text-muted text-sm">Manage your escrow transactions and payouts</p>
                    </div>
                    <button className="btn btn-primary" disabled={totalAvailable <= 0}>
                        Withdraw to Bank
                    </button>
                </header>

                {error && (
                    <div className="error-banner">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <div className="payment-summary-row">
                    <div className="cylo-card stat-card">
                        <CheckCircle className={`text-success ${totalAvailable > 0 ? 'animate-pulse' : ''}`} size={24} />
                        <div>
                            <p className="text-muted">Available (Business Account)</p>
                            <h2 className="amount">R {totalAvailable.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h2>
                        </div>
                    </div>
                    <div className="cylo-card stat-card">
                        <Clock className="text-warning" size={24} />
                        <div>
                            <p className="text-muted">Currently in Escrow</p>
                            <h2 className="amount">R {totalPending.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h2>
                        </div>
                    </div>
                </div>

                <div className="listings-grid">
                    <div className="table-header-row hidden-mobile">
                        <span>Transaction Details</span>
                        <span>Date</span>
                        <span>Status</span>
                        <span className="text-right">Amount</span>
                        <span className="text-right">Action</span>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="empty-state">
                            <p>No transactions found. Start buying or selling to see history.</p>
                        </div>
                    ) : (
                        transactions.map(tx => {
                            const isBuyer = tx.buyerId === userId;
                            return (
                                <div key={tx.id} className="manage-card payment-row">
                                    <div className="tx-info">
                                        <div className={`icon-box ${isBuyer ? 'bg-dark' : 'bg-success'}`}>
                                            {isBuyer ? <ArrowDownCircle size={16} /> : <DollarSign size={16} />}
                                        </div>
                                        <div>
                                            <h4>{tx.itemDescription || `Order #${tx.tradeSafeId?.substring(0, 8)}`}</h4>
                                            <span className="badge-type">{isBuyer ? "PURCHASE" : "SALE"}</span>
                                        </div>
                                    </div>

                                    <span className="tx-date">{new Date(tx.createdAt).toLocaleDateString('en-ZA')}</span>

                                    <div className="tx-status">
                                        <span className={`status-pill ${tx.status?.toLowerCase()}`}>
                                            {tx.status}
                                        </span>
                                    </div>

                                    <span className={`tx-amount ${isBuyer ? 'negative' : 'positive'}`}>
                                        {isBuyer ? '-' : '+'} R {tx.amount.toLocaleString('en-ZA')}
                                    </span>

                                    <div className="tx-actions text-right">
                                        {/* BUYER ACTION: Confirm receipt to release money to seller */}
                                        {isBuyer && tx.status === 'FUNDS_RECEIVED' && (
                                            <button 
                                                onClick={() => handleReleaseFunds(tx.id)}
                                                className="btn-action-success"
                                            >
                                                Confirm Delivery
                                            </button>
                                        )}
                                        
                                        {/* SELLER ACTION: Show proof of escrow */}
                                        {!isBuyer && tx.status === 'FUNDS_RECEIVED' && (
                                            <span className="text-xs text-success font-bold">Funds Secured</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;