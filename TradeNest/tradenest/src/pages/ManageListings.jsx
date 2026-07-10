import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation"; 
import PaymentHistory from "./PaymentHistory"; 
import Toast from "../components/Toast"; 
import api from "../services/api"; 
import { Trash2, Edit3, ExternalLink, Plus, AlertTriangle } from "lucide-react"; 
import "../styles/ManageListings.css";

const ManageListings = () => {
    const [view, setView] = useState("inventory"); 
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Custom Confirmation Modal States
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [activeDeleteId, setActiveDeleteId] = useState(null);

    // Toast State Management
    const [toast, setToast] = useState(null);

    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const showToast = (message, type) => {
        setToast({ message, type });
    };

    const fetchUserPosts = async () => {
        try {
            // Using unified Axios client to automatically append Bearer token and match base domain mapping
            const response = await api.get(`/api/posts/user/${userId}`);
            
            // Axios automatically maps JSON response content into data
            setPosts(response.data.data || []);
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
            showToast("Failed to sync inventory from server.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId && token) {
            fetchUserPosts();
        } else {
            navigate("/signIn");
        }
    }, [userId, token, navigate]);

    // Triggers custom UI confirmation state instead of freezing browser
    const initiateDeleteCheck = (postId) => {
        setActiveDeleteId(postId);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!activeDeleteId) return;

        try {
            // Swapped fetch for your interceptor-protected axios client setup
            const response = await api.delete(`/api/posts/${activeDeleteId}`);

            if (response.status === 200) {
                setPosts(posts.filter(p => p.id !== activeDeleteId));
                showToast("Listing successfully removed from Cylo! 🗑️", "success");
            }
        } catch (error) {
            console.error("Delete Error:", error);
            
            // Pull full error tracing description if thrown from your C# controller logic
            const serverMessage = error.response?.data?.details || error.response?.data?.message || "Failed to remove listing.";
            showToast(`Error: ${serverMessage}`, "error");
        } finally {
            // Reset overlay control states cleanly
            setIsConfirmOpen(false);
            setActiveDeleteId(null);
        }
    };

    if (loading) return <div className="loading">Syncing Cylo Inventory... ⏳</div>;

    return (
        <div className="profile-layout">
            <Navigation />

            {/* Render Custom Toast Notifications */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            {/* Custom Modern Confirmation Modal Backdrop */}
            {isConfirmOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(10, 10, 14, 0.75)", // Deep dark backdrop tint
                    backdropFilter: "blur(6px)",
                    zIndex: 10000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px"
                }}>
                    <div style={{
                        backgroundColor: "#1e1e24", // Premium theme matching card
                        maxWidth: "400px",
                        width: "100%",
                        borderRadius: "16px",
                        padding: "24px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
                        border: "1px solid #2d2d34",
                        textAlign: "center"
                    }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px auto"
                        }}>
                            <AlertTriangle size={24} />
                        </div>
                        <h3 style={{ margin: "0 0 8px 0", color: "#ffffff", fontSize: "18px", fontWeight: "600" }}>Remove Listing?</h3>
                        <p style={{ margin: "0 0 24px 0", color: "#a0aec0", fontSize: "14px", lineHeight: "1.5" }}>
                            Are you sure you want to permanently take down this listing from your Cylo storefront? This action cannot be undone.
                        </p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button 
                                onClick={() => { setIsConfirmOpen(false); setActiveDeleteId(null); }}
                                style={{
                                    flex: 1,
                                    padding: "10px 16px",
                                    borderRadius: "10px",
                                    border: "1px solid #3f3f46",
                                    backgroundColor: "transparent",
                                    color: "#e4e4e7",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                    fontSize: "14px"
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmDelete}
                                style={{
                                    flex: 1,
                                    padding: "10px 16px",
                                    borderRadius: "10px",
                                    border: "none",
                                    backgroundColor: "#ef4444",
                                    color: "#ffffff",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                    fontSize: "14px"
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-section">
                <div className="dashboard-header-main">
                    <h1>Management</h1>
                    <button className="btn-create-new" onClick={() => navigate('/upload')}>
                        <Plus size={18} /> New Listing
                    </button>
                </div>

                <div className="dashboard-tabs">
                    <button className={view === "inventory" ? "tab-active" : "tab-inactive"} onClick={() => setView("inventory")}>
                        Inventory ({posts.length})
                    </button>
                </div>

                {view === "inventory" ? (
                    <div className="manage-table">
                        <div className="table-header">
                            <span>Listing Details</span>
                            <span>Reference</span>
                            <span>Price</span>
                            <span className="text-right">Actions</span>
                        </div>
                        {posts.length > 0 ? posts.map((post) => (
                            <div key={post.id} className="manage-row">
                                <div className="item-cell">
                                    <h4 className="listing-title">{post.title}</h4>
                                </div>

                                <div className="ref-cell">
                                    <span className="ref-id">ID-{post.id.toString().slice(-6).toUpperCase()}</span>
                                </div>

                                <div className="price-cell">
                                    R {post.price.toLocaleString()}
                                </div>

                                <div className="actions-cell">
                                    <button className="icon-btn" onClick={() => navigate(`/post/${post.id}`)} title="View">
                                        <ExternalLink size={16} />
                                    </button>
                                    <button className="icon-btn edit" onClick={() => navigate(`/edit-post/${post.id}`)} title="Edit">
                                        <Edit3 size={16} />
                                    </button>
                                    <button className="icon-btn delete" onClick={() => initiateDeleteCheck(post.id)} title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">No active listings found.</div>
                        )}
                    </div>
                ) : (
                    <PaymentHistory userId={userId} token={token} />
                )}
            </div>
        </div>
    );
};

export default ManageListings;