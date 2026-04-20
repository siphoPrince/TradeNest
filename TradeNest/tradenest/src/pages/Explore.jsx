import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { Play, X, Heart, MessageCircle, Share2, ShoppingBag } from "lucide-react"; 
import "../styles/Explore.css";

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    
    // --- NEW MODAL STATE ---
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://localhost:7124/api/Categories");
                const data = await response.json();
                setCategories([{ id: 0, name: "All" }, ...data]);
            } catch (error) { console.error(error); }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const url = activeCategory === "All" 
                    ? `https://localhost:7124/api/Posts` 
                    : `https://localhost:7124/api/Posts/category/${activeCategory}`;
                const response = await fetch(url);
                const data = await response.json();
                setPosts(data.data || []); 
            } catch (error) { console.error(error); } 
            finally { setLoading(false); }
        };
        fetchPosts();
    }, [activeCategory]);

    const isVideo = (url) => url?.match(/\.(mp4|webm|ogg|mov)$/i);

    return (
        <div className="explore-page">
            <Navigation />

            <div className="explore-main-content">
                <div className="explore-header">
                    <div className="category-scroll-wrapper">
                        {categories.map((cat) => (
                            <button 
                                key={cat.id || cat.name}
                                className={`explore-cat-btn ${activeCategory === cat.name ? "active" : ""}`}
                                onClick={() => setActiveCategory(cat.name)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="explore-container">
                    {loading ? (
                        <div className="explore-loader"><div className="spinner"></div></div>
                    ) : (
                        <div className="explore-grid">
                            {posts.map((post) => (
                                <div 
                                    key={post.id} 
                                    className="explore-item" 
                                    onClick={() => setSelectedPost(post)} // Open Modal
                                >
                                    {isVideo(post.mediaUrl) ? (
                                        <div className="video-wrapper">
                                            <video src={`https://localhost:7124/uploads/${post.mediaUrl}`} className="explore-img" muted playsInline />
                                            <div className="video-badge"><Play size={14} fill="white" /></div>
                                        </div>
                                    ) : (
                                        <img src={`https://localhost:7124/uploads/${post.mediaUrl}`} alt={post.title} className="explore-img" />
                                    )}
                                    <div className="explore-item-overlay">
                                        <div className="overlay-info">
                                            <span className="overlay-price">R{post.price}</span>
                                            <span className="overlay-title">{post.title}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- THE MODAL POP-UP --- */}
            {selectedPost && (
                <div className="explore-modal-overlay" onClick={() => setSelectedPost(null)}>
                    <button className="modal-close-btn"><X size={32} /></button>
                    
                    <div className="explore-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-media-side">
                            {isVideo(selectedPost.mediaUrl) ? (
                                <video 
                                    src={`https://localhost:7124/uploads/${selectedPost.mediaUrl}`} 
                                    controls 
                                    autoPlay 
                                    loop 
                                />
                            ) : (
                                <img src={`https://localhost:7124/uploads/${selectedPost.mediaUrl}`} alt={selectedPost.title} />
                            )}
                        </div>

                        <div className="modal-info-side">
                            <div className="modal-user-header">
                                <div className="avatar small">{selectedPost.handleName?.[0] || "U"}</div>
                                <strong>{selectedPost.handleName || "User"}</strong>
                            </div>
                            
                            <div className="modal-body">
                                <h3>{selectedPost.title}</h3>
                                <p className="modal-description">{selectedPost.description || "No description provided."}</p>
                                <h2 className="modal-price">R{selectedPost.price}</h2>
                            </div>

                            <div className="modal-actions">
                                <div className="action-icons">
                                    <Heart size={24} />
                                    <MessageCircle size={24} />
                                    <Share2 size={24} />
                                </div>
                                <button className="btn-primary buy-btn">
                                    <ShoppingBag size={18} /> Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Explore;