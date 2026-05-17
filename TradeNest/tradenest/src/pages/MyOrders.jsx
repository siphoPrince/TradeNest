import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, AlertTriangle, Check, User, Tag, Loader2, CreditCard, Trash2, XCircle, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'; 
import '../styles/MyOrders.css'; 

const API_BASE_URL = 'https://localhost:7124/api/Payments';

const getStatusClass = (status) => {
    const s = status?.toUpperCase();
    if (s === 'FUNDS_DEPOSITED' || s === 'DEPOSITED') return 'status-success';
    if (s === 'COMPLETED' || s === 'FUNDS_RELEASED') return 'status-completed';
    if (s === 'DISPUTED' || s === 'CANCELLING') return 'status-disputed'; 
    if (s === 'CREATED') return 'status-created';
    if (s === 'CANCELLED' || s === 'REFUNDED' || s === 'CANCELED') return 'status-neutral'; 
    if (s === 'DELIVERY' || s === 'INITIATED' || s === 'IN_TRANSIT') return 'status-handover';
    return 'status-default';
};

const formatOrderDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

const MyOrders = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('buying');
    
    const [searchTerm, setSearchTerm] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ordersPerPage = 10; 

    // Actions & Form Modals State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalMode, setModalMode] = useState('dispute'); 
    const [disputeReason, setDisputeReason] = useState('');
    
    // Modern UI Popups State Replacement
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const [customConfirm, setCustomConfirm] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'warning' });

    const [processingOrders, setProcessingOrders] = useState({});
    const currentUserId = localStorage.getItem('userId');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Trigger Modern Toast Notification Helper
    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
    };

    // Auto-dismiss Custom Toast Alert
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Handle Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400); 
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch Orders implementation
    const fetchOrders = useCallback(async (showLoading = true, pageToFetch = currentPage, searchVal = debouncedSearch) => {
        if (!currentUserId) return;
        if (showLoading) setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/my-orders/${currentUserId}`, {
                params: {
                    page: pageToFetch,
                    pageSize: ordersPerPage,
                    view: view,
                    search: searchVal.trim() 
                }
            });
            
            setOrders(response.data.items || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error("Error fetching orders:", error);
            showToast("Failed to fetch up-to-date order records.", "error");
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [view, currentUserId, ordersPerPage]); 

    // Sync views when page context elements update
    useEffect(() => {
        fetchOrders(true, currentPage, debouncedSearch);
    }, [currentPage, view, debouncedSearch, fetchOrders]); 

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); 
    };

    const handleViewChange = (newView) => {
        setView(newView);
        setSearchTerm('');
        setDebouncedSearch('');
        setCurrentPage(1); 
    };

    // Watch query parameter status codes cleanly 
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const status = searchParams.get('status');
        const reason = searchParams.get('reason');
        const transactionId = searchParams.get('transactionId');

        if (status === 'failure' && reason === 'canceled') {
            showToast(`Payment cancelled for transaction: ${transactionId || ''}`, 'warning');
            navigate(location.pathname, { replace: true });
            fetchOrders(false, currentPage, debouncedSearch);
        }
    }, [location, navigate, fetchOrders, currentPage, debouncedSearch]);

    // Background escrow listener sync
    useEffect(() => {
        const hasActiveTransactions = orders.some(o => 
            ['CREATED', 'FUNDS_DEPOSITED', 'DEPOSITED', 'INITIATED', 'DELIVERY', 'IN_TRANSIT'].includes(o.status?.toUpperCase())
        );

        if (hasActiveTransactions) {
            const interval = setInterval(() => {
                fetchOrders(false, currentPage, debouncedSearch); 
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [orders, fetchOrders, currentPage, debouncedSearch]);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handlePaymentRedirect = (checkoutUrl) => {
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        }
    };

    // Replaced window.confirm wrapper
    const handleDeleteOrder = (orderId) => {
        setCustomConfirm({
            show: true,
            title: "Delete Order Request",
            message: "Are you sure you want to completely delete this pending order item?",
            type: "danger",
            onConfirm: async () => {
                setProcessingOrders(prev => ({ ...prev, [orderId]: true }));
                try {
                    await axios.delete(`${API_BASE_URL}/delete-transaction/${orderId}`);
                    setOrders(prev => prev.filter(o => o.id !== orderId));
                    showToast("Order transaction successfully wiped.", "success");
                } catch (error) {
                    showToast(error.response?.data?.message || "Could not delete order processing step.", "error");
                } finally {
                    setProcessingOrders(prev => ({ ...prev, [orderId]: false }));
                }
            }
        });
    };

    // Replaced window.confirm wrapper
    const handleRelease = (orderId) => {
        setCustomConfirm({
            show: true,
            title: "Confirm Meetup Delivery",
            message: "Only release secure funds if you have explicitly inspected your item and are completely satisfied with the handover.",
            type: "success",
            onConfirm: async () => {
                setProcessingOrders(prev => ({ ...prev, [orderId]: true }));
                try {
                    const response = await axios.post(`${API_BASE_URL}/release-funds/${orderId}`);
                    const finalStatus = response.data.status || 'COMPLETED';
                    
                    setOrders(prev => prev.map(o => 
                        o.id === orderId ? { ...o, status: finalStatus } : o
                    ));
                    showToast("Payment release triggered successfully! Transaction complete.", "success");
                } catch (error) {
                    showToast(error.response?.data?.message || "Action failed. Escrow framework might still be processing parameters.", "error");
                } finally {
                    setProcessingOrders(prev => ({ ...prev, [orderId]: false }));
                }
            }
        });
    };

    const handleModalSubmit = async () => {
        if (!disputeReason.trim()) return showToast("Please select a valid reason to proceed.", "warning");
        setProcessingOrders(prev => ({ ...prev, [selectedOrder.id]: true }));
        
        const endpoint = modalMode === 'refund' 
            ? `${API_BASE_URL}/refund-transaction/${selectedOrder.id}`
            : `${API_BASE_URL}/dispute-transaction/${selectedOrder.id}`;

        try {
            await axios.post(
                endpoint, 
                { reason: disputeReason }, 
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            const targetedStatus = modalMode === 'refund' ? 'REFUNDED' : 'DISPUTED';
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: targetedStatus } : o));
            setIsModalOpen(false);
            setDisputeReason('');
            showToast(modalMode === 'refund' ? "Order successfully cancelled and fully refunded." : "Escrow payout formal dispute logged safely.", "success");
        } catch (error) {
            showToast(error.response?.data?.message || "Could not execute status transition.", "error");
        } finally {
            setProcessingOrders(prev => ({ ...prev, [selectedOrder.id]: false }));
        }
    };

    // Replaced window.confirm wrapper
    const handleStartHandover = (orderId) => {
        setCustomConfirm({
            show: true,
            title: "Initiate Product Delivery Handover",
            message: "Are you physically with the buyer right now? This step alerts their app console to release transaction escrow instantly.",
            type: "warning",
            onConfirm: async () => {
                setProcessingOrders(prev => ({ ...prev, [orderId]: true }));
                try {
                    const response = await axios.post(`${API_BASE_URL}/start-handover/${orderId}`);
                    const newStatus = response.data.status || 'INITIATED';
                    
                    setOrders(prev => prev.map(o => 
                        o.id === orderId ? { ...o, status: newStatus } : o
                    ));
                    showToast("Handover activated! Request buyer confirmation notification receipt.", "success");
                } catch (error) {
                    showToast(error.response?.data?.message || "Could not register initial handover state.", "error");
                } finally {
                    setProcessingOrders(prev => ({ ...prev, [orderId]: false }));
                }
            }
        });
    };

    return (
        <div className="dashboard-container">
            {/* Native Modern CSS Toast Feedback Element Container */}
            {toast.show && (
                <div className={`modern-app-toast global-toast-${toast.type}`}>
                    <span>{toast.message}</span>
                    <button className="toast-dismiss-btn" onClick={() => setToast(prev => ({ ...prev, show: false }))}>
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="dashboard-header">
                <h2 className="dashboard-title">Cylo Marketplace Dashboard</h2>
                <div className="view-toggle">
                    <button className={`toggle-btn ${view === 'buying' ? 'active' : ''}`} onClick={() => handleViewChange('buying')}>
                        <Tag size={16} /> My Purchases
                    </button>
                    <button className={`toggle-btn ${view === 'selling' ? 'active' : ''}`} onClick={() => handleViewChange('selling')}>
                        <User size={16} /> My Sales
                    </button>
                </div>
            </div>

            <div className="search-bar-container" style={{ margin: '0px 0px 20px 0px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input 
                    type="text"
                    placeholder="Search by Order # or Item Name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{
                        width: '100%',
                        padding: '10px 12px 10px 40px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                />
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
                                <th>Date & Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                        No transactions found matching your active filters.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const orderStatus = order.status?.toUpperCase() || '';
                                    const isItemProcessing = !!processingOrders[order.id];
                                    
                                    return (
                                        <tr key={order.id}>
                                            <td data-label="Order">#{order.id}</td>
                                            <td data-label="Item">{order.itemDescription}</td>
                                            <td data-label="Amount">R{order.amount}</td>
                                            <td data-label="Date & Time" style={{ fontSize: '13px', color: '#4b5563' }}>
                                                {formatOrderDate(order.createdAt)} 
                                            </td>
                                            <td data-label="Status">
                                                <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                    {orderStatus === 'DISPUTED' ? '⚠️ UNDER DISPUTE' : order.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td data-label="Actions">
                                                <div className="action-group">
                                                    <button className="icon-btn" onClick={() => navigate(`/inbox?orderId=${order.id}`)}>
                                                        <MessageSquare size={16} />
                                                    </button>

                                                    {['DISPUTED', 'CANCELLING'].includes(orderStatus) ? (
                                                        <div className="dispute-lockout-badge">
                                                            <span>⚠️ Funds Frozen in Escrow</span>
                                                        </div>
                                                    ) : ['CANCELLED', 'REFUNDED', 'CANCELED'].includes(orderStatus) ? (
                                                        <div className="dispute-lockout-badge">
                                                            <span>Funds Locked Securely</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {['CREATED', 'FUNDS_DEPOSITED', 'DEPOSITED'].includes(orderStatus) && (
                                                                <button 
                                                                    className="icon-btn btn-cancel-refund"
                                                                    title="Cancel & Refund Order"
                                                                    disabled={isItemProcessing}
                                                                    onClick={() => {
                                                                        setSelectedOrder(order);
                                                                        setModalMode('refund');
                                                                        setDisputeReason('');
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                    style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                                                >
                                                                    <XCircle size={16} />
                                                                </button>
                                                            )}

                                                            {['INITIATED', 'DELIVERY', 'IN_TRANSIT'].includes(orderStatus) && (
                                                                <button 
                                                                    className="icon-btn btn-dispute-trigger" 
                                                                    title="Dispute / Cancel Transaction"
                                                                    disabled={isItemProcessing}
                                                                    onClick={() => {
                                                                        setSelectedOrder(order);
                                                                        setModalMode('dispute');
                                                                        setDisputeReason('');
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                    style={{ color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
                                                                >
                                                                    <AlertTriangle size={16} />
                                                                </button>
                                                            )}
                                                            
                                                            {view === 'buying' && orderStatus === 'CREATED' && (
                                                                <>
                                                                    <button disabled={isItemProcessing} onClick={() => handlePaymentRedirect(order.checkoutUrl)} className="btn-pay-action">
                                                                        <CreditCard size={16} /> Pay
                                                                    </button>
                                                                    <button disabled={isItemProcessing} onClick={() => handleDeleteOrder(order.id)} className="icon-btn btn-delete">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </>
                                                            )}

                                                            {view === 'buying' && ['FUNDS_DEPOSITED', 'DEPOSITED'].includes(orderStatus) && (
                                                                <div className="waiting-container text-muted">
                                                                    <span className="waiting-text" style={{ fontSize: '12px', color: '#6b7280' }}>Waiting for seller to start handover...</span>
                                                                </div>
                                                            )}

                                                            {view === 'buying' && ['INITIATED', 'DELIVERY', 'IN_TRANSIT'].includes(orderStatus) && (
                                                                <button disabled={isItemProcessing} onClick={() => handleRelease(order.id)} className="btn-release-action">
                                                                    {isItemProcessing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Confirm Receipt
                                                                </button>
                                                            )}

                                                            {view === 'selling' && ['FUNDS_DEPOSITED', 'DEPOSITED'].includes(orderStatus) && (
                                                                <button disabled={isItemProcessing} onClick={() => handleStartHandover(order.id)} className="btn-start-action">
                                                                    {isItemProcessing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Start Handover
                                                                </button>
                                                            )}
                                                            
                                                            {view === 'selling' && ['INITIATED', 'DELIVERY', 'IN_TRANSIT'].includes(orderStatus) && (
                                                                <div className="waiting-container">
                                                                    <Loader2 className="animate-spin" size={14} />
                                                                    <span className="waiting-text">Handover Active: Waiting for buyer...</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <button 
                                className="pagination-arrow" 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            <div className="pagination-info">
                                Page <span>{currentPage}</span> of {totalPages}
                            </div>

                            <button 
                                className="pagination-arrow" 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Selection/Input Action Form Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{modalMode === 'refund' ? 'Cancel & Refund Transaction' : 'Dispute Active Delivery'}</h3>
                        <p>Are you sure you want to proceed with Order #{selectedOrder?.id}?</p>
                        
                        <select 
                            className="dispute-input"
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                        >
                            <option value="">Select reason...</option>
                            {modalMode === 'refund' ? (
                                <>
                                    <option value="Changed my mind">Change of heart / Mind change</option>
                                    <option value="Seller unresponsive">Seller is not responding</option>
                                    <option value="Incorrect details">Incorrect item listing details</option>
                                </>
                            ) : (
                                <>
                                    <option value="Buyer/Seller didn't show">No-show at meetup</option>
                                    <option value="Item not as described">Item not as described</option>
                                    <option value="Fraudulent activity suspected">Suspected fraudulent activity</option>
                                </>
                            )}
                        </select>
                        
                        <div className="modal-footer">
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>Close</button>
                            <button 
                                className="btn-confirm-dispute" 
                                onClick={handleModalSubmit}
                                disabled={!!processingOrders[selectedOrder?.id] || !disputeReason}
                                style={{ backgroundColor: modalMode === 'refund' ? '#ef4444' : '#f59e0b' }}
                            >
                                {processingOrders[selectedOrder?.id] ? "Processing..." : modalMode === 'refund' ? "Confirm Refund" : "Confirm Dispute"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Modern Confirmation Modal Replacement for window.confirm */}
            {customConfirm.show && (
                <div className="modal-overlay custom-confirm-overlay">
                    <div className="modal-content custom-confirm-card">
                        <div className={`confirm-icon-hdr icon-type-${customConfirm.type}`}>
                            <AlertTriangle size={28} />
                        </div>
                        <h3>{customConfirm.title}</h3>
                        <p>{customConfirm.message}</p>
                        <div className="modal-footer confirm-footer-layout">
                            <button className="btn-close" onClick={() => setCustomConfirm(prev => ({ ...prev, show: false }))}>
                                Cancel
                            </button>
                            <button 
                                className={`btn-confirm-dispute action-bg-${customConfirm.type}`}
                                onClick={() => {
                                    if (customConfirm.onConfirm) customConfirm.onConfirm();
                                    setCustomConfirm(prev => ({ ...prev, show: false }));
                                }}
                            >
                                Proceed Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;