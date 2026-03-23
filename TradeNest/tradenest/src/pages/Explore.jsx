import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import "../styles/Explore.css";

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]); // Dynamic state
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");

    // 1. Fetch Categories once on load
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://localhost:7124/api/Categories");
                const data = await response.json();
                // Add "All" to the start of the list manually
                setCategories([{ id: 0, name: "All" }, ...data]);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // 2. Fetch Posts whenever activeCategory changes
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

    return (
        <div className="explore-page">
            <Navigation />

            <div className="Explore-container">
                <div className="header">
                    <h2>Explore</h2>
                </div>

                {/* Category Navigation - Now Dynamic */}
                <div className="category-nav">
                    {categories.map((cat) => (
                        <button 
                            key={cat.id || cat.name}
                            className={`cat-btn ${activeCategory === cat.name ? "active" : ""}`}
                            onClick={() => setActiveCategory(cat.name)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Listings Grid */}
                <div className="listings-grid">
                    {loading ? (
                        <div className="loading-state">Finding the best deals... 🔍</div>
                    ) : posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post.id} className="listing-card">
                                <img 
                                    src={`https://localhost:7124/uploads/${post.mediaUrl}`} 
                                    alt={post.title} 
                                    className="listing-img"
                                    onError={(e) => e.target.src = "https://picsum.photos/400/600"}
                                />
                                <div className="listing-info">
                                    <span className="listing-title">{post.title}</span>
                                    <span className="listing-price">R{post.price}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">Nothing found in {activeCategory} yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Explore;