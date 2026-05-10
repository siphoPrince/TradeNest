import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Added for search handling
import Navigation from "../components/Navigation";
import { Play, X, Heart, MessageCircle, Share2, ShoppingBag, SearchX } from "lucide-react"; 
import "../styles/Explore.css";

const Explore = () => {
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedPost, setSelectedPost] = useState(null);

    // Get search and location params from URL
    const searchQuery = searchParams.get("search");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

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
                // Construct dynamic URL
                let url = `https://localhost:7124/api/Posts/explore?`;
                
                if (activeCategory !== "All") url += `category=${activeCategory}&`;
                if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
                if (lat && lon) url += `lat=${lat}&lon=${lon}&radius=50`;

                const response = await fetch(url);
                const data = await response.json();
                
                // Handle different response structures (data.data or direct array)
                setPosts(data.data || data || []); 
            } catch (error) { 
                console.error("Search Error:", error);
                setPosts([]); 
            } 
            finally { setLoading(false); }
        };
        fetchPosts();
    }, [activeCategory, searchQuery, lat, lon]); // Listens to URL changes

    const getMediaUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return `https://localhost:7124/uploads/${url}`;
    };

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
                    {searchQuery && (
                        <div className="search-status">
                            <p>
                                Showing {activeCategory !== "All" ? <strong>{activeCategory}</strong> : ""} results for: 
                                <strong> "{searchQuery}"</strong>
                            </p>
                            {/* Optional: Add a clear search button here */}
                            <button className="clear-search-text" onClick={() => navigate('/explore')}>Clear Search</button>
                        </div>
                    )}

                    {loading ? (
                        <div className="explore-loader"><div className="spinner"></div></div>
                    ) : posts.length > 0 ? (
                        <div className="explore-grid">
                            {posts.map((post) => (
                                <div 
                                    key={post.id} 
                                    className="explore-item" 
                                    onClick={() => setSelectedPost(post)}
                                >
                                    {isVideo(post.mediaUrl) ? (
                                        <div className="video-wrapper">
                                            <video src={getMediaUrl(post.mediaUrl)} className="explore-img" muted playsInline />
                                            <div className="video-badge"><Play size={14} fill="white" /></div>
                                        </div>
                                    ) : (
                                        <img src={getMediaUrl(post.mediaUrl)} alt={post.title} className="explore-img" />
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
                    ) : (
                        <div className="no-results-container">
                            <SearchX size={64} strokeWidth={1} />
                            <h3>No items found</h3>
                            <p>Try searching for something else or adjusting your filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedPost && (
                <div className="explore-modal-overlay" onClick={() => setSelectedPost(null)}>
                    <button className="modal-close-btn"><X size={32} /></button>
                    
                    <div className="explore-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-media-side">
                            {isVideo(selectedPost.mediaUrl) ? (
                                <video 
                                    src={getMediaUrl(selectedPost.mediaUrl)} 
                                    controls 
                                    autoPlay 
                                    loop 
                                />
                            ) : (
                                <img src={getMediaUrl(selectedPost.mediaUrl)} alt={selectedPost.title} />
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
                                {selectedPost.tags && selectedPost.tags.length > 0 && (
                                    <div className="modal-tags">
                                        {selectedPost.tags.map(tag => (
                                            <span key={tag.id} className="explore-tag">#{tag.name}</span>
                                        ))}
                                    </div>
                                )}
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