import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import FilterBar from "./FilterBar"; 
import SearchBar from "../components/SearchBar";
import { Play, X, Heart, MessageCircle, Share2, ShoppingBag, SearchX, MapPin, Users, BaggageClaim } from "lucide-react"; 
import "../styles/Explore.css";

const Explore = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [items, setItems] = useState([]); 
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Read URL State Variables Safely - Explicitly fall back to "products"
    const searchQuery = searchParams.get("search") || "";
    const activeCategory = searchParams.get("category") || "All";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const activeSuburb = searchParams.get("suburb") || "";
    const activeCity = searchParams.get("city") || "";
    const activeProvince = searchParams.get("province") || "";
    const searchType = searchParams.get("type") || "products";

    // Dynamic Business Condition Flags for Escrow / Management Actions
    const currentUserId = localStorage.getItem("userId") || ""; 
    const isOwnPost = selectedPost?.userId === currentUserId;
    const isSoldOut = selectedPost?.quantity <= 0 || selectedPost?.status === "Sold";

    // Fetch master list of categories once on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://cylosocials.co.za/api/Categories");
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
            // Guard clause: Prevent empty profile query lookups gracefully
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
                    params.append("query", searchQuery.trim());
                    url = `https://cylosocials.co.za/api/profile/search?${params.toString()}`;
                } else {
                    if (activeCategory !== "All") params.append("category", activeCategory);
                    if (searchQuery) params.append("search", searchQuery.trim());
                    if (minPrice) params.append("minPrice", minPrice);
                    if (maxPrice) params.append("maxPrice", maxPrice);
                    if (activeSuburb) params.append("suburb", activeSuburb);
                    if (activeCity) params.append("city", activeCity);
                    if (activeProvince) params.append("province", activeProvince);
                    
                    url = `https://cylosocials.co.za/api/Profile/explore?${params.toString()}`;
                }

                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Server returned status: ${response.status}`);
                }

                const responseText = await response.text();
                if (!responseText) {
                    setItems([]);
                    return;
                }
                
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

    // Handler to instantly mark an item sold from inside the active modal view
    const handleDecrementQuantity = async () => {
        if (!selectedPost?.id) return;
        setIsProcessing(true);
        try {
            const response = await fetch(`https://cylosocials.co.za/api/Products/mark-sold/${selectedPost.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (response.ok) {
                // Instantly update local search collections array to sync UI grid listings
                setItems(prev => prev.map(item => 
                    item.id === selectedPost.id ? { ...item, quantity: 0, status: "Sold" } : item
                ));
                setSelectedPost(null); // Close active modal viewport presentation deck cleanly
                alert("Item successfully marked as sold!");
            } else {
                alert("Failed to update item status. Please try again.");
            }
        } catch (err) {
            console.error("Failed updating stock status metric:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const saveScroll = () => {
        localStorage.setItem("explore_scroll_pos", window.scrollY.toString());
    };

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
        return `https://cylosocials.co.za/uploads/${url}`;
    };

    const isVideo = (url) => url?.match(/\.(mp4|webm|ogg|mov)$/i);

    const formatLocation = (suburb, city) => {
        if (suburb && city) return `${suburb}, ${city}`;
        return suburb || city || "South Africa";
    };

    return (
        <div className="explore-page var-bg-fix">
            <Navigation />
            
            <div className="explore-main-content">
                <div className="explore-container">
                    
                    {/* Centered Structured Search Toolbar */}
                    <div className="explore-toolbar">
                        <div className="search-container">
                            <SearchBar />
                        </div>
                        {searchType === "products" && (
                            <div className="filter-btn-wrapper">
                                <FilterBar onApply={handleApplyDrawerFilters} />
                            </div>
                        )}
                    </div>

                    {/* Category Selection Carousel Section */}
                    {searchType === "products" && (
                        <div className="explore-header">
                            <div className="category-scroll-wrapper">
                                {categories?.map((cat) => (
                                    <button 
                                        key={cat?.id || cat?.name}
                                        className={`category-pill ${activeCategory === cat?.name ? "active" : ""}`}
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
                            <p style={{ color: 'var(--color-text-dark)' }}>
                                Showing {searchType} 
                                {activeCategory !== "All" && searchType === "products" && <span> in <strong>{activeCategory}</strong></span>}
                                {searchQuery && <span> for: <strong>"{searchQuery}"</strong></span>}
                                {(activeSuburb || activeCity) && searchType === "products" && <span> near: <strong>{formatLocation(activeSuburb, activeCity)}</strong></span>}
                            </p>
                            <button className="clear-search-text" onClick={handleGlobalClear} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Clear All</button>
                        </div>
                    )}

                    {/* Content Presentation Switch Deck */}
                    {loading ? (
                        <div className="explore-loader">
                            <div className="spinner"></div>
                        </div>
                    ) : items && items.length > 0 ? (
                        searchType === "creators" ? (
                            <div className="creator-search-results">
                                {items.map((profile) => (
                                    <div 
                                        key={profile.userId} 
                                        className="creator-search-card cylo-card"
                                        onClick={() => navigate(`/profile/${profile.userId}`)}
                                    >
                                        <img 
                                            src={profile.imageUrl ? getMediaUrl(profile.imageUrl) : "https://picsum.photos/80"} 
                                            alt={profile.name}
                                            style={{ borderRadius: '50%' }}
                                        />
                                        <div>
                                            <span style={{ color: 'var(--color-text-dark)', fontWeight: '600' }}>{profile.name} {profile.surName}</span>
                                            <small className="text-muted">@{profile.handleName || "creator"}</small>
                                            {(profile.suburb || profile.city) && (
                                                <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                                    <MapPin size={12} />
                                                    <span>{formatLocation(profile.suburb, profile.city)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
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
                                                <div className="card-location-badge spec-badge">
                                                    <MapPin size={10} /> {post.suburb || post.city}
                                                </div>
                                            )}
                                            <div className="overlay-info">
                                                <span className="product-price-tag" style={{ padding: '2px 6px' }}>R{post?.price}</span>
                                                <span className="overlay-title" style={{ color: '#ffffff', fontWeight: '500', fontSize: '13px' }}>{post?.title}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="no-results-container" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                            <SearchX size={64} strokeWidth={1} />
                            <h3 style={{ color: 'var(--color-text-dark)', marginTop: '1rem' }}>No {searchType} found</h3>
                            <p>Try searching for something else or resetting your global filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Detail Overlay Popup Section */}
            {selectedPost && (
                <div className="explore-modal-overlay" onClick={() => setSelectedPost(null)} style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
                    <button className="modal-close-btn" style={{ color: '#fff' }}><X size={32} /></button>
                    <div className="explore-modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                        <div className="modal-media-side" style={{ backgroundColor: '#000' }}>
                            {isVideo(selectedPost?.mediaUrl) ? (
                                <video src={getMediaUrl(selectedPost?.mediaUrl)} controls autoPlay loop style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <img src={getMediaUrl(selectedPost?.mediaUrl)} alt={selectedPost?.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            )}
                        </div>
                        <div className="modal-info-side" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div className="modal-user-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                    <div className="avatar small" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-dark)', fontWeight: '600', backgroundImage: selectedPost?.avatarUrl ? `url(${getMediaUrl(selectedPost.avatarUrl)})` : 'none', backgroundSize: 'cover' }}>
                                        {!selectedPost?.avatarUrl && (selectedPost?.handleName?.[0] || "U")}
                                    </div>
                                    <strong 
                                        style={{ cursor: 'pointer', color: 'var(--color-text-dark)' }} 
                                        onClick={() => {
                                            const targetUserId = selectedPost?.userId;
                                            if (targetUserId) navigate(`/profile/${targetUserId}`);
                                        }}
                                    >
                                        @{selectedPost?.handleName || "User"}
                                    </strong>
                                </div>
                                <div className="modal-body" style={{ padding: '0px' }}>
                                    <h3 style={{ color: 'var(--color-text-dark)' }}>{selectedPost?.title}</h3>
                                    <p className="text-muted" style={{ margin: '0.5rem 0 1.5rem 0' }}>{selectedPost?.description || "No description provided."}</p>
                                    <h2 style={{ color: 'var(--color-primary)' }}>R{selectedPost?.price}</h2>
                                    
                                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-bg)', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                                        <MapPin size={14} style={{ color: 'var(--color-accent)' }} /> 
                                        <span>Available for meetup/escrow in: <strong>{formatLocation(selectedPost?.suburb, selectedPost?.city)}</strong></span>
                                    </p>
                                </div>
                            </div>

                            {/* Dynamically Styled Action Footers */}
                            <div className="modal-actions" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                {isSoldOut ? (
                                    <button className="buynow sold-out-disabled-btn" disabled style={{ width: '100%', padding: '16px', borderRadius: '14px', background: '#ccc', color: '#666', border: 'none', cursor: 'not-allowed', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        Out of Stock 📦
                                    </button>
                                ) : isOwnPost ? (
                                    <button 
                                        className="buynow reduce-stock-btn" 
                                        onClick={handleDecrementQuantity}
                                        disabled={isProcessing}
                                        style={{ width: '100%', padding: '16px', borderRadius: '14px', background: '#f59e0b', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        {isProcessing ? "Updating..." : "Mark Item Sold"}
                                    </button>
                                ) : (
                                    <Link 
                                        to={`/BuyNow/${selectedPost?.id}`} 
                                        className="buynow buy-btn" 
                                        onClick={saveScroll}
                                        style={{ textDecoration: 'none', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        Buy Now &nbsp; <BaggageClaim size={18}/>
                                    </Link>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Explore;