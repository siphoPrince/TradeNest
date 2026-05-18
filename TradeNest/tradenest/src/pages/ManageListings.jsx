import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation"; 
import PaymentHistory from "./PaymentHistory"; 
import { Trash2, Edit3, ExternalLink, Plus } from "lucide-react"; 
import "../styles/ManageListings.css";

const ManageListings = () => {
    const [view, setView] = useState("inventory"); 
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const fetchUserPosts = async () => {
        try {
            const response = await fetch(`https://localhost:7124/api/posts/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPosts(data.data || []);
            }
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
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

    const handleDelete = async (postId) => {
        if (window.confirm("Remove this listing from Cylo?")) {
            try {
                const response = await fetch(`https://localhost:7124/api/posts/${postId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    setPosts(posts.filter(p => p.id !== postId));
                }
            } catch (error) {
                console.error("Delete Error:", error);
            }
        }
    };

    if (loading) return <div className="loading">Syncing Cylo Inventory... ⏳</div>;

    return (
        <div className="profile-layout">
            <Navigation />
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
                                    <button className="icon-btn delete" onClick={() => handleDelete(post.id)} title="Delete">
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
