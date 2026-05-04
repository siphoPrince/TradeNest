import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation"; 
import PaymentHistory from "./PaymentHistory"; 
import "../styles/ManageListings.css";

const ManageListings = () => {
    const [view, setView] = useState("inventory"); 
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                // This specific route ensures we only get THIS user's posts
                const response = await fetch(`https://localhost:7124/api/posts/user/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    // We only set the posts belonging to this specific founder
                    setPosts(data.data || []);
                }
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId && token) {
            fetchUserPosts();
        } else {
            navigate("/signIn");
        }
    }, [userId, token, navigate]);

    if (loading) return <div className="loading">Syncing your Cylo profile... ⏳</div>;

    return (
        <div className="profile-layout">
            <Navigation />
            <div className="dashboard-section">
                
                {/* TAB SYSTEM */}
                <div className="dashboard-tabs">
                    <button 
                        className={view === "inventory" ? "tab-active" : "tab-inactive"} 
                        onClick={() => setView("inventory")}
                    >
                        My Listings ({posts.length})
                    </button>
                    <button 
                        className={view === "payments" ? "tab-active" : "tab-inactive"} 
                        onClick={() => setView("payments")}
                    >
                        My Wallet & Payouts
                    </button>
                </div>

                {view === "inventory" ? (
                    <>
                        <div className="dashboard-header">
                            <h3>Active Inventory</h3>
                            <button className="btn-save" onClick={() => navigate('/upload')}>
                                + List New Item
                            </button>
                        </div>

                        <div className="listings-grid">
                            {posts.length > 0 ? posts.map((post) => (
                                <div key={post.id} className="manage-card">
                                    <img 
                                        src={`https://localhost:7124/uploads/${post.mediaUrl}`} 
                                        alt={post.title} 
                                        onError={(e) => e.target.src = "https://picsum.photos/100"}
                                    />
                                    <div className="manage-card-info">
                                        <span className="status-badge">Live</span>
                                        <h4>{post.title}</h4>
                                        <span className="price-tag">R {post.price.toLocaleString()}</span>
                                    </div>
                                    <div className="manage-actions">
                                        <button className="btn-icon-edit" onClick={() => navigate(`/edit-post/${post.id}`)}>Edit</button>
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-state">
                                    <p>You haven't posted any items yet.</p>
                                    <button onClick={() => navigate('/upload')}>Create your first listing</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* The payment component now sits perfectly inside this section */
                    <PaymentHistory userId={userId} token={token} />
                )}
            </div>
        </div>
    );
};

export default ManageListings;