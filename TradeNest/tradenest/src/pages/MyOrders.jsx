import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, AlertTriangle, Check, User, Tag, Loader2, X, CreditCard, Trash2 } from 'lucide-react';
import '../styles/MyOrders.css'; 

const getStatusClass = (status) => {
    switch (status) {
        case 'DEPOSITED': 
        case 'FUNDS_DEPOSITED': return 'status-success';   // Money in Escrow
        case 'PAID':
        case 'RELEASING': return 'status-pending';
        case 'FUNDS_RELEASED': 
        case 'Completed': return 'status-completed';     // Money sent to Seller
        case 'CREATED': return 'status-created';         // Waiting for payment
        case 'CANCELLED':
        case 'REFUNDED':
        case 'DISPUTED': return 'status-disputed';
        case 'INITIATED': return 'status-handover';
        default: return 'status-default';
    }
};

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('buying');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [disputeReason, setDisputeReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUserId = localStorage.getItem('userId');

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            // We call the base endpoint
            const response = await axios.get(`https://localhost:7124/api/Payments/my-orders/${currentUserId}`);
            
            // OPTIONAL: If you implemented the "sync" endpoint we discussed earlier, 
            // you could map through 'CREATED' orders here to refresh their status.
            
            const filteredData = response.data.filter(o => 
                view === 'buying' ? o.buyerId === parseInt(currentUserId) : o.sellerId === parseInt(currentUserId)
            );
            setOrders(filteredData);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }, [view, currentUserId]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handlePaymentRedirect = (checkoutUrl) => {
        if (checkoutUrl) {
            window.location.href = checkoutUrl; // Send user back to TradeSafe to finish payment
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("Delete this pending order?")) {
            try {
                await axios.delete(`https://localhost:7124/api/Payments/delete-transaction/${orderId}`);
                setOrders(prev => prev.filter(o => o.id !== orderId));
            } catch (error) {
                alert("Could not delete order.");
            }
        }
    };

    const handleRelease = async (orderId) => {
    if (window.confirm("Confirm Meetup? Only release funds if you have the item and are satisfied.")) {
        try {
            await axios.post(`https://localhost:7124/api/Payments/release-funds/${orderId}`);
            
            // Update local state to 'RELEASING' to match the backend return
            setOrders(prev => prev.map(o => 
                o.id === orderId ? { ...o, status: 'RELEASING' } : o
            ));
            
            alert("Payment release triggered! The seller will receive funds shortly.");
        } catch (error) {
            alert(error.response?.data?.message || "Action failed.");
        }
    }
};

    const handleDisputeSubmit = async () => {
        if (!disputeReason.trim()) return alert("Please provide a reason.");
        setIsSubmitting(true);
        try {
            // Updated to use the Cancel mutation logic via your new backend route
            await axios.post(`https://localhost:7124/api/Payments/cancel-transaction`, {
                orderId: selectedOrder.id,
                reason: disputeReason
            });
            
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'CANCELLED' } : o));
            setIsModalOpen(false);
            setDisputeReason('');
            alert("Order cancelled/disputed successfully.");
        } catch (error) {
            alert("Could not process cancellation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartHandover = async (orderId) => {
    if (window.confirm("Are you with the buyer? This will notify them to release the funds.")) {
        try {
            await axios.post(`https://localhost:7124/api/Payments/start-delivery/${orderId}`);
            
            // Update local state to 'INITIATED'
            setOrders(prev => prev.map(o => 
                o.id === orderId ? { ...o, status: 'INITIATED' } : o
            ));
            
            alert("Handover started! Ask the buyer to confirm receipt on their device.");
        } catch (error) {
            alert(error.response?.data?.message || "Could not start handover.");
        }
    }
};

    return (
        <div className="dashboard-container">
            {/* Header section remains similar */}
            <div className="dashboard-header">
                <h2 className="dashboard-title">Cylo Marketplace Dashboard</h2>
                <div className="view-toggle">
                    <button className={`toggle-btn ${view === 'buying' ? 'active' : ''}`} onClick={() => setView('buying')}>
                        <Tag size={16} /> My Purchases
                    </button>
                    <button className={`toggle-btn ${view === 'selling' ? 'active' : ''}`} onClick={() => setView('selling')}>
                        <User size={16} /> My Sales
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : (
                <div className="table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Item</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.itemDescription}</td>
                                    <td>R{order.amount}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                                            {order.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                
                                    <td>
                                        <div className="action-group">
                                            {/* CHAT ACTION */}
                                            <button className="icon-btn" onClick={() => navigate(`/inbox?orderId=${order.id}`)}>
                                                <MessageSquare size={16} />
                                            </button>
                                            
                                            {/* BUYER ACTION: PAY (If still CREATED) */}
                                            {view === 'buying' && order.status === 'CREATED' && (
                                                <>
                                                    <button onClick={() => handlePaymentRedirect(order.checkoutUrl)} className="btn-pay-action">
                                                        <CreditCard size={16} /> Pay
                                                    </button>
                                                    <button onClick={() => handleDeleteOrder(order.id)} className="icon-btn btn-delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}

                                            {/* BUYER ACTION: RELEASE (If DEPOSITED) */}
                                            {view === 'buying' && (order.status === 'FUNDS_DEPOSITED') && (
                                                            <button onClick={() => handleRelease(order.id)} className="btn-release-action">
                                                                <Check size={16} /> Confirm Receipt
                                                            </button>
                                                        )}

                                            {/* --- SELLER ONLY ACTIONS --- */}
                                            {view === 'selling' && (
                                                <>
                                                    {/* Seller clicks this when they meet the buyer in person */}
                                                    {(order.status === 'FUNDS_DEPOSITED' || order.status === 'DEPOSITED') && (
                                                        <button onClick={() => handleStartHandover(order.id)} className="btn-start-action">
                                                            <Check size={16} /> Start Handover
                                                        </button>
                                                    )}
                                                    
                                                    {order.status === 'INITIATED' && (
                                                        <span className="waiting-text">Waiting for Buyer...</span>
                                                    )}
                                                </>
                                            )}

                                            {/* CANCEL/DISPUTE (Visible for active transactions) */}
                                            {['CREATED', 'DEPOSITED', 'FUNDS_DEPOSITED'].includes(order.status) && (
                                                <button 
                                                    className="icon-btn btn-dispute"
                                                    onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                                                >
                                                    <AlertTriangle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Logic remains but updated with specific TradeSafe reasons */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Manage Transaction</h3>
                        <p>Are you sure you want to cancel or dispute Order #{selectedOrder?.id}?</p>
                        <select 
                            className="dispute-input"
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                        >
                            <option value="">Select reason...</option>
                            <option value="Buyer/Seller didn't show">No-show at meetup</option>
                            <option value="Item not as described">Item not as described</option>
                            <option value="Changed my mind">Change of heart</option>
                        </select>
                        <div className="modal-footer">
                            <button onClick={() => setIsModalOpen(false)}>Close</button>
                            <button className="btn-confirm-dispute" onClick={handleDisputeSubmit}>Confirm Action</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;