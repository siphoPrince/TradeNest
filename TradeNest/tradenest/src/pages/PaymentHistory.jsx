import "../styles/PaymentHistory.css";
import Navigation from "../components/Navigation";
import { DollarSign, Clock, CheckCircle, ArrowDownCircle } from 'lucide-react';

const PaymentHistory = () => {
    // Mock data - replace with your API call to /api/payments/history
    const transactions = [
        { id: 1, type: "Sold", item: "Vintage BMW Grill", amount: 1200, status: "completed", date: "21 Apr 2026" },
        { id: 2, type: "Sold", item: "M-Sport Rims", amount: 8500, status: "pending", date: "20 Apr 2026" },
        { id: 3, type: "Payout", item: "Withdrawal to FNB", amount: -5000, status: "completed", date: "18 Apr 2026" },
    ];

    return (
        <div className="profile-layout">
            <Navigation />
            <div className="dashboard-section">
                <header className="dashboard-header">
                    <h3>Payment History</h3>
                    <button className="btn btn-primary">Withdraw Funds</button>
                </header>

                {/* SUMMARY STATS ROW */}
                <div className="payment-summary-row">
                    <div className="cylo-card stat-card">
                        <CheckCircle className="text-success" size={24} />
                        <div>
                            <p className="text-muted">Sold (Available)</p>
                            <h2 className="amount">R 12,450.00</h2>
                        </div>
                    </div>
                    <div className="cylo-card stat-card">
                        <Clock className="text-warning" size={24} />
                        <div>
                            <p className="text-muted">Pending Escrow</p>
                            <h2 className="amount">R 3,200.00</h2>
                        </div>
                    </div>
                </div>

                {/* TRANSACTION LINE ITEMS */}
                <div className="listings-grid">
                    <div className="table-header-row">
                        <span>Transaction</span>
                        <span>Date</span>
                        <span>Status</span>
                        <span className="text-right">Amount</span>
                    </div>

                    {transactions.map(tx => (
                        <div key={tx.id} className="manage-card payment-row">
                            <div className="tx-info">
                                <div className={`icon-box ${tx.amount > 0 ? 'bg-success' : 'bg-dark'}`}>
                                    {tx.amount > 0 ? <DollarSign size={16} /> : <ArrowDownCircle size={16} />}
                                </div>
                                <div>
                                    <h4>{tx.item}</h4>
                                    <span className="text-muted">{tx.type}</span>
                                </div>
                            </div>
                            
                            <span className="tx-date">{tx.date}</span>

                            <div className="tx-status">
                                <span className={`status-pill ${tx.status}`}>
                                    {tx.status}
                                </span>
                            </div>

                            <span className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                                {tx.amount > 0 ? `+ R ${tx.amount}` : `- R ${Math.abs(tx.amount)}`}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;