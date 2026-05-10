import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, AlertTriangle, Check, User, Tag, Loader2, X } from 'lucide-react';
import '../styles/MyOrders.css'; 

const getStatusClass = (status) => {
    switch (status) {
        case 'FUNDS_RECEIVED': return 'status-completed';
        case 'PENDING': return 'status-pending';
        case 'CREATED': return 'status-created';
        case 'Completed': return 'status-completed';
        case 'DISPUTED': return 'status-disputed';
        default: return 'status-default';
    }
};

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('buying');
    
    // Dispute Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [disputeReason, setDisputeReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`https://localhost:7124/api/orders/${view}/${currentUserId}`);
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [view, currentUserId]);

    const handleRelease = async (orderId) => {
        if (window.confirm("Confirm Meetup? Only release funds if you have the item.")) {
            try {
                await axios.post(`https://localhost:7124/api/orders/release`, orderId, {
                    headers: { 'Content-Type': 'application/json' }
                });
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o));
            } catch (error) {
                alert("Action failed. Try again.");
            }
        }
    };

    const handleDisputeSubmit = async () => {
        if (!disputeReason.trim()) return alert("Please provide a reason for the dispute.");
        
        setIsSubmitting(true);
        try {
            const disputeData = {
                orderId: selectedOrder.id,
                reason: disputeReason,
                raisedByUserId: currentUserId,
                status: "Open"
            };

            await axios.post(`https://localhost:7124/api/disputes`, disputeData);
            
            // Update local state to show DISPUTED status immediately
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'DISPUTED' } : o));
            setIsModalOpen(false);
            setDisputeReason('');
            alert("Dispute raised. Cylo support will investigate the transaction.");
        } catch (error) {
            alert("Could not raise dispute. Please try again or contact support.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Marketplace Dashboard</h2>
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
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : (
                <div className="table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Item</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No {view} orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td data-label="Order ID">#{order.id}</td>
                                        <td data-label="Item">{order.post?.title || "Marketplace Item"}</td>
                                        <td data-label="Amount">R{order.post?.price || order.amount}</td>
                                        <td data-label="Status">
                                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                {order.status ? order.status.replace('_', ' ') : 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td data-label="Actions">
                                            <div className="action-group">
                                                <button 
                                                    className="icon-btn" 
                                                    onClick={() => {
                                                        const otherUserId = view === 'buying' ? order.post?.userId : order.buyerId;
                                                        if (otherUserId) {
                                                            navigate(`/inbox?orderId=${order.id}&userId=${otherUserId}`);
                                                        }
                                                    }}
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                                
                                                {/* Release button only for buyer and active orders */}
                                                {view === 'buying' && order.status === 'FUNDS_RECEIVED' && (
                                                    <button onClick={() => handleRelease(order.id)} className="icon-btn btn-release">
                                                        <Check size={16} /> Approve
                                                    </button>
                                                )}

                                                {/* Dispute button hidden if already completed or already disputed */}
                                                {order.status !== 'Completed' && order.status !== 'DISPUTED' && (
                                                    <button 
                                                        className="icon-btn btn-dispute"
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setIsModalOpen(true);
                                                        }}
                                                    >
                                                        <AlertTriangle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Dispute Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Raise a Dispute</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p className="order-ref">Order: #{selectedOrder?.id}</p>
                            <label>Reason for dispute:</label>
                            <select 
                                className="dispute-input"
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                            >
                                <option value="">Select a reason...</option>
                                <option value="Item not as described">Item not as described</option>
                                <option value="Seller did not show up">Seller did not show up</option>
                                <option value="Item is damaged/broken">Item is damaged/broken</option>
                                <option value="Other">Other</option>
                            </select>
                            
                            <textarea 
                                placeholder="Tell us what happened..."
                                className="dispute-input textarea"
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button 
                                className="btn-confirm-dispute" 
                                onClick={handleDisputeSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Dispute"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;