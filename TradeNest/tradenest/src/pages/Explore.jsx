import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import FilterBar from "./FilterBar"; // Updated to match component rendering name
import SearchBar from "../components/SearchBar";
import { Play, X, Heart, MessageCircle, Share2, ShoppingBag, SearchX } from "lucide-react"; 
import "../styles/Explore.css";

const Explore = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);

    // Read URL State Variables Safely (handles null values on mount)
    const searchQuery = searchParams.get("search") || "";
    const activeCategory = searchParams.get("category") || "All";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const lat = searchParams.get("lat") || "";
    const lon = searchParams.get("lon") || "";

    // Fetch master list of categories once on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://localhost:7124/api/Categories");
                const data = await response.json();
                
                // Defensive check to guarantee an array spreads correctly
                const safeData = Array.isArray(data) ? data : [];
                setCategories([{ id: 0, name: "All" }, ...safeData]);
            } catch (error) { 
                console.error("Failed to load categories:", error); 
                setCategories([{ id: 0, name: "All" }]); // Fallback default state
            }
        };
        fetchCategories();
    }, []);

    // Fetch posts when ANY parameter inside the URL changes
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                let url = `https://localhost:7124/api/Posts/explore?`;
                
                // Formulate parameters for backend controllers
                if (activeCategory !== "All") url += `category=${encodeURIComponent(activeCategory)}&`;
                if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
                if (minPrice) url += `minPrice=${minPrice}&`;
                if (maxPrice) url += `maxPrice=${maxPrice}&`;
                if (lat && lon) url += `lat=${lat}&lon=${lon}&radius=50`;

                const response = await fetch(url);
                const data = await response.json();
                
                // Unify common .NET Core API layout architectures
                setPosts(data.data || data || []); 
            } catch (error) { 
                console.error("Search Fetch Error:", error);
                setPosts([]); 
            } finally { 
                setLoading(false); 
            }
        };
        
        fetchPosts();
    }, [activeCategory, searchQuery, minPrice, maxPrice, lat, lon]);

    // Handle updating URL when category pills are tapped
    const handleCategorySelect = (categoryName) => {
        const params = new URLSearchParams(searchParams);
        if (categoryName === "All") {
            params.delete("category");
        } else {
            params.set("category", categoryName);
        }
        navigate(`/explore?${params.toString()}`);
    };

    // Handles updates arriving from advanced FilterDrawer/FilterBar
    const handleApplyDrawerFilters = (updatedFilters) => {
        const params = new URLSearchParams(searchParams);
        
        Object.keys(updatedFilters).forEach((key) => {
            if (updatedFilters[key]) {
                params.set(key, updatedFilters[key]);
            } else {
                params.delete(key);
            }
        });
        
        navigate(`/explore?${params.toString()}`);
    };

    // Total structural reset
    const handleGlobalClear = () => {
        navigate('/explore');
    };

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
                {/* Actions Toolbar Container */}
                <div className="explore-toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 20px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                    <SearchBar />
                    <FilterBar onApply={handleApplyDrawerFilters} />
                </div>

                <div className="explore-header">
                    <div className="category-scroll-wrapper">
                        {/* Null-safe optional chaining fallback */}
                        {categories?.map((cat) => (
                            <button 
                                key={cat?.id || cat?.name}
                                className={`explore-cat-btn ${activeCategory === cat?.name ? "active" : ""}`}
                                onClick={() => handleCategorySelect(cat?.name)}
                            >
                                {cat?.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="explore-container">
                    {/* Status Info Row */}
                    {(searchQuery || activeCategory !== "All" || minPrice || maxPrice) && (
                        <div className="search-status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                            <p style={{ margin: 0 }}>
                                Showing results 
                                {activeCategory !== "All" && <span> in <strong>{activeCategory}</strong></span>}
                                {searchQuery && <span> for: <strong>"{searchQuery}"</strong></span>}
                                {(minPrice || maxPrice) && <span> inside price filter</span>}
                            </p>
                            <button className="clear-search-text" onClick={handleGlobalClear} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontWeight: '500' }}>Clear All</button>
                        </div>
                    )}

                    {loading ? (
                        <div className="explore-loader"><div className="spinner"></div></div>
                    ) : posts && posts.length > 0 ? (
                        <div className="explore-grid">
                            {posts.map((post) => (
                                <div key={post?.id} className="explore-item" onClick={() => setSelectedPost(post)}>
                                    {isVideo(post?.mediaUrl) ? (
                                        <div className="video-wrapper">
                                            <video src={getMediaUrl(post?.mediaUrl)} className="explore-img" muted playsInline />
                                            <div className="video-badge"><Play size={14} fill="white" /></div>
                                        </div>
                                    ) : (
                                        <img src={getMediaUrl(post?.mediaUrl)} alt={post?.title || "Explore asset"} className="explore-img" />
                                    )}
                                    <div className="explore-item-overlay">
                                        <div className="overlay-info">
                                            <span className="overlay-price">R{post?.price}</span>
                                            <span className="overlay-title">{post?.title}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results-container">
                            <SearchX size={64} strokeWidth={1} />
                            <h3>No items found</h3>
                            <p>Try searching for something else or resetting your global filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Detail Overlay Popup */}
            {selectedPost && (
                <div className="explore-modal-overlay" onClick={() => setSelectedPost(null)}>
                    <button className="modal-close-btn"><X size={32} /></button>
                    <div className="explore-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-media-side">
                            {isVideo(selectedPost?.mediaUrl) ? (
                                <video src={getMediaUrl(selectedPost?.mediaUrl)} controls autoPlay loop />
                            ) : (
                                <img src={getMediaUrl(selectedPost?.mediaUrl)} alt={selectedPost?.title} />
                            )}
                        </div>
                        <div className="modal-info-side">
                            <div className="modal-user-header">
                                <div className="avatar small">{selectedPost?.handleName?.[0] || "U"}</div>
                                <strong>{selectedPost?.handleName || "User"}</strong>
                            </div>
                            <div className="modal-body">
                                <h3>{selectedPost?.title}</h3>
                                <p className="modal-description">{selectedPost?.description || "No description provided."}</p>
                                <h2 className="modal-price">R{selectedPost?.price}</h2>
                            </div>
                            <div className="modal-actions">
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
};

export default Explore;