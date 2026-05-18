import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import FilterBar from "./FilterBar"; 
import SearchBar from "../components/SearchBar";
import { Play, X, Heart, MessageCircle, Share2, ShoppingBag, SearchX, MapPin, Users } from "lucide-react"; 
import "../styles/Explore.css";

const Explore = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [items, setItems] = useState([]); // Represents dynamic state results (products or profiles)
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);

    // Read URL State Variables Safely
    const searchQuery = searchParams.get("search") || "";
    const activeCategory = searchParams.get("category") || "All";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const activeSuburb = searchParams.get("suburb") || "";
    const activeCity = searchParams.get("city") || "";
    const activeProvince = searchParams.get("province") || "";
    const searchType = searchParams.get("type") || "products";

    // Fetch master list of categories once on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://localhost:7124/api/Categories");
                if (!response.ok) throw new Error("Categories bad response");
                
                const responseText = await response.text();
                const data = responseText ? JSON.parse(responseText) : [];
                const safeData = Array.isArray(data) ? data : [];
                setCategories([{ id: 0, name: "All" }, ...safeData]);
            } catch (error) { 
                console.error("Failed to load categories:", error); 
                setCategories([{ id: 0, name: "All" }]); 
            }
        };
        fetchCategories();
    }, []);

    // Fetch results dynamically when ANY URL parameter state alterations fire
    useEffect(() => {
        const fetchSearchResults = async () => {
            // Guard clause: Prevent empty profile query lookups
            if (searchType === "creators" && !searchQuery.trim()) {
                setItems([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                let url = "";
                const params = new URLSearchParams();

                if (searchType === "creators") {
                    // 1. Point dynamically to backend profiles search route
                    params.append("query", searchQuery.trim());
                    url = `https://localhost:7124/api/profile/search?${params.toString()}`;
                } else {
                    // 2. Point to standard catalog item search route
                    if (activeCategory !== "All") params.append("category", activeCategory);
                    if (searchQuery) params.append("search", searchQuery.trim());
                    if (minPrice) params.append("minPrice", minPrice);
                    if (maxPrice) params.append("maxPrice", maxPrice);
                    if (activeSuburb) params.append("suburb", activeSuburb);
                    if (activeCity) params.append("city", activeCity);
                    if (activeProvince) params.append("province", activeProvince);
                    
                    url = `https://localhost:7124/api/Profile/explore?${params.toString()}`;
                }

                const response = await fetch(url);
                
                // Fail elegantly if network status code indicates failure
                if (!response.ok) {
                    throw new Error(`Server returned status: ${response.status}`);
                }

                const responseText = await response.text();
                if (!responseText) {
                    setItems([]);
                    return;
                }
                
                // Parse out response envelope variations cleanly
                const data = JSON.parse(responseText);
                const finalizedItems = Array.isArray(data) ? data : data.data || [];
                setItems(finalizedItems); 
            } catch (error) { 
                console.error("Explore Fetch Error:", error);
                setItems([]); 
            } finally {
                setLoading(false); 
            }
        };
        
        fetchSearchResults();
    }, [activeCategory, searchQuery, minPrice, maxPrice, activeSuburb, activeCity, activeProvince, searchType]);

    const handleCategorySelect = (categoryName) => {
        const params = new URLSearchParams(searchParams);
        if (categoryName === "All") {
            params.delete("category");
        } else {
            params.set("category", categoryName);
        }
        navigate(`/explore?${params.toString()}`);
    };

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

    const handleGlobalClear = () => {
        navigate('/explore');
    };

    const getMediaUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return `https://localhost:7124/uploads/${url}`;
    };

    const isVideo = (url) => url?.match(/\.(mp4|webm|ogg|mov)$/i);

    const formatLocation = (suburb, city) => {
        if (suburb && city) return `${suburb}, ${city}`;
        return suburb || city || "South Africa";
    };

    return (
        <div className="explore-page">
            <Navigation />
            
            <div className="explore-main-content">
                <div className="explore-container">
                    
                    {/* Centered Structured Search Toolbar */}
                    <div className="explore-toolbar">
                        <SearchBar />
                        {searchType === "products" && <FilterBar onApply={handleApplyDrawerFilters} />}
                    </div>

                    {/* Only display category pill choices when tracking standard merchandise items */}
                    {searchType === "products" && (
                        <div className="explore-header">
                            <div className="category-scroll-wrapper">
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
                    )}

                    {/* Active Filters Context Status Line */}
                    {(searchQuery || activeCategory !== "All" || minPrice || maxPrice || activeSuburb || activeCity) && (
                        <div className="search-status">
                            <p>
                                Showing {searchType} 
                                {activeCategory !== "All" && searchType === "products" && <span> in <strong>{activeCategory}</strong></span>}
                                {searchQuery && <span> for: <strong>"{searchQuery}"</strong></span>}
                                {(activeSuburb || activeCity) && searchType === "products" && <span> near: <strong>{formatLocation(activeSuburb, activeCity)}</strong></span>}
                            </p>
                            <button className="clear-search-text" onClick={handleGlobalClear}>Clear All</button>
                        </div>
                    )}

                    {loading ? (
                        <div className="explore-loader">
                            <div className="spinner"></div>
                        </div>
                    ) : items && items.length > 0 ? (
                        searchType === "creators" ? (
                            /* --- CREATOR / PROFILE ROW GRID VIEW --- */
                            <div className="creator-search-results">
                                {items.map((profile) => (
                                    <div 
                                        key={profile.userId} 
                                        className="creator-search-card"
                                        onClick={() => navigate(`/profile/${profile.userId}`)}
                                    >
                                        <img 
                                            src={profile.imageUrl ? getMediaUrl(profile.imageUrl) : "https://picsum.photos/80"} 
                                            alt={profile.name}
                                        />
                                        <div>
                                            <span>{profile.name} {profile.surName}</span>
                                            <small>@{profile.handleName || "creator"}</small>
                                            {(profile.suburb || profile.city) && (
                                                <div>
                                                    <MapPin size={12} />
                                                    <span>{formatLocation(profile.suburb, profile.city)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* --- TRADITIONAL PRODUCT DISPLAY GRID --- */
                            <div className="explore-grid">
                                {items.map((post) => (
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
                                            {(post?.suburb || post?.city) && (
                                                <div className="card-location-badge">
                                                    <MapPin size={10} /> {post.suburb || post.city}
                                                </div>
                                            )}
                                            <div className="overlay-info">
                                                <span className="overlay-price">R{post?.price}</span>
                                                <span className="overlay-title">{post?.title}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="no-results-container">
                            <SearchX size={64} strokeWidth={1} />
                            <h3>No {searchType} found</h3>
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
                                <div className="avatar small" style={{ backgroundImage: selectedPost?.avatarUrl ? `url(${getMediaUrl(selectedPost.avatarUrl)})` : 'none', backgroundSize: 'cover' }}>
                                    {!selectedPost?.avatarUrl && (selectedPost?.handleName?.[0] || "U")}
                                </div>
                                <strong style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${selectedPost.userId}`)}>
                                    @{selectedPost?.handleName || "User"}
                                </strong>
                            </div>
                            <div className="modal-body">
                                <h3>{selectedPost?.title}</h3>
                                <p className="modal-description">{selectedPost?.description || "No description provided."}</p>
                                <h2 className="modal-price">R{selectedPost?.price}</h2>
                                
                                <p style={{ fontSize: '13px', color: '#555', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', border: '1px solid #eee' }}>
                                    <MapPin size={14} style={{ color: '#007aff' }} /> 
                                    <span>Available for meetup/escrow in: <strong>{formatLocation(selectedPost?.suburb, selectedPost?.city)}</strong></span>
                                </p>
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