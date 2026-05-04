import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, AlertTriangle, Check, User, Tag, Loader2 } from 'lucide-react';
import '../styles/MyOrders.css'; 

// 1. Define the helper function outside the component
const getStatusClass = (status) => {
    switch (status) {
        case 'FUNDS_RECEIVED': return 'status-completed';
        case 'PENDING': return 'status-pending';
        case 'CREATED': return 'status-created';
        case 'Completed': return 'status-completed'; // Added for your handleRelease update
        default: return 'status-default';
    }
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('buying');
    const currentUserId = 1; 

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
    }, [view]);

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

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Marketplace Dashboard</h2>
                
                <div className="view-toggle">
                    <button 
                        className={`toggle-btn ${view === 'buying' ? 'active' : ''}`}
                        onClick={() => setView('buying')}>
                        <Tag size={16} /> My Purchases
                    </button>
                    <button 
                        className={`toggle-btn ${view === 'selling' ? 'active' : ''}`}
                        onClick={() => setView('selling')}>
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
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                        No {view} orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        {/* Fallback for item name if it's missing in your DB dump */}
                                        <td>{order.post?.title || "Marketplace Item"}</td>
                                        <td>R{order.post?.amount}</td>
                                        <td>
                                            {/* 2. The function is now defined, so this won't crash */}
                                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                {order.status ? order.status.replace('_', ' ') : 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-group">
                                                <button className="icon-btn" title="Message"><MessageSquare size={16} /></button>
                                                
                                                {view === 'buying' && order.status !== 'Completed' && (
                                                    <button 
                                                        onClick={() => handleRelease(order.id)}
                                                        className="icon-btn btn-release"
                                                    >
                                                        <Check size={16} /> Approve Meetup
                                                    </button>
                                                )}

                                                <button className="icon-btn btn-dispute" title="Dispute">
                                                    <AlertTriangle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyOrders;