import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { Play } from "lucide-react"; // Import a video icon
import "../styles/Explore.css";

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://localhost:7124/api/Categories");
                const data = await response.json();
                setCategories([{ id: 0, name: "All" }, ...data]);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
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
            } catch (error) {
                console.error("Error fetching explore posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [activeCategory]);

    // Helper to check if file is a video
    const isVideo = (url) => {
        return url?.match(/\.(mp4|webm|ogg|mov)$/i);
    };

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
                        <div className="explore-loader">
                            <div className="spinner"></div>
                            <p>Loading the feed...</p>
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="explore-grid">
                            {posts.map((post) => (
                                <div key={post.id} className="explore-item">
                                    {isVideo(post.mediaUrl) ? (
                                        <div className="video-wrapper">
                                            <video 
                                                src={`https://localhost:7124/uploads/${post.mediaUrl}`} 
                                                className="explore-img"
                                                muted
                                                loop
                                                playsInline
                                                onMouseEnter={(e) => e.target.play()}
                                                onMouseLeave={(e) => {
                                                    e.target.pause();
                                                    e.target.currentTime = 0; // Reset to start
                                                }}
                                            />
                                            <div className="video-badge">
                                                <Play size={14} fill="white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <img 
                                            src={`https://localhost:7124/uploads/${post.mediaUrl}`} 
                                            alt={post.title} 
                                            className="explore-img"
                                            onError={(e) => e.target.src = "https://picsum.photos/500/500"}
                                        />
                                    )}

                                    {/* Hover overlay for PC */}
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
                        <div className="explore-empty">
                            <p>No items found in {activeCategory}.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Explore;