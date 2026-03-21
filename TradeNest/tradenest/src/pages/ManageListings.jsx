import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation"; 
import "../styles/ManageListings.css"

const ManageListings = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    // This hook runs ONLY when the component first mounts
    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const response = await fetch(`https://localhost:7124/api/posts/user/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Remember: your API returns a PagedResponse, data is in .data
                    setPosts(data.data || []);
                }
            } catch (error) {
                console.error("Failed to load dashboard posts:", error);
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

    // Handle Delete within the dashboard
    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure? This will remove the video permanently.")) return;

        try {
            const response = await fetch(`https://localhost:7124/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Update local state so it disappears instantly
                setPosts(posts.filter(p => p.id !== postId));
            }
        } catch (error) {
            alert("Error deleting post.");
        }
    };

    if (loading) return <div className="loading">Analyzing your inventory... ⏳</div>;

    return (
        <div className="profile-layout">
            <Navigation />
            <div className="dashboard-section">
                <div className="dashboard-header">
                    <h3>Inventory & Analytics</h3>
                    <button className="btn-save" onClick={() => navigate('/create-post')}>
                        + Add New Video
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
                                <span className="status-badge">Active</span>
                                <h4>{post.title}</h4>
                                <span className="price-tag">R{post.price}</span>

                                <div className="manage-card-stats">
                                    <div className="stat-item">Views: <span>{post.views || 0}</span></div>
                                    <div className="stat-item">Likes: <span>{post.likeCount || 0}</span></div>
                                    <div className="stat-item">Comments: <span>{post.commentCount || 0}</span></div>
                                </div>
                            </div>

                            <div className="manage-actions">
                                <button className="btn-icon-edit" onClick={() => navigate(`/edit-post/${post.id}`)}>
                                    Edit
                                </button>
                                <button className="btn-icon-delete" onClick={() => handleDelete(post.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    )) : (
                        <p className="no-posts">No active listings found. Start selling today!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageListings;