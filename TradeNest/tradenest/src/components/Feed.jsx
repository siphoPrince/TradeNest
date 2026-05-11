import React, { useState, useEffect } from "react";
import Engagement from "./Engagement";
import ProductCard from "./ProductCard";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import CommentSection from "./CommentSection";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    // Track which post has its comments expanded
    const [expandedPostId, setExpandedPostId] = useState(null);
    // Track global search across the feed
    const [searchQuery, setSearchQuery] = useState("");

    // Triggered when the comment icon in Engagement is clicked
    const toggleComments = (postId) => {
    if (expandedPostId === postId) {
        setExpandedPostId(null);
        document.body.style.overflow = "unset"; // Re-enable scroll
    } else {
        setExpandedPostId(postId);
        document.body.style.overflow = "hidden"; // Lock background scroll
    }
};
    useEffect(() => {
    if (searchQuery) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}, [searchQuery]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("https://localhost:7124/api/posts?pageNumber=1&pageSize=10", {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : "" ,
                        'Cache-Control': 'no-cache',
                    }
                });

                const result = await response.json();
                setPosts(result.data || []);
                setLoading(false);

                const savedScroll = sessionStorage.getItem("feed-scroll");
            if (savedScroll) {
                // Use a tiny timeout to ensure React has finished painting the HTML
                setTimeout(() => {
                    window.scrollTo({
                        top: parseInt(savedScroll),
                        behavior: 'instant' 
                    });
                    sessionStorage.removeItem("feed-scroll");
                }, 250);
            }
            } catch (error) {
                console.error("Error fetching feed:", error);
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Filter posts dynamically based on the search query
    const filteredPosts = posts.filter(post => {
            const query = searchQuery.toLowerCase().trim();
            
            // Check title, description, and handle
            const basicMatch = 
                post.title?.toLowerCase().includes(query) ||
                post.description?.toLowerCase().includes(query) ||
                (post.handleName || post.name)?.toLowerCase().includes(query);

            // Check tags (if they are included in your DTO)
            const tagMatch = post.tags?.some(tag => 
                tag.name.toLowerCase().includes(query.replace('#', ''))
            );

            return basicMatch || tagMatch;
        });

    // --- LOADING STATE (SKELETONS) ---
    if (loading) {
        return (
            <div className="feed">
                <div className="main-screen">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="post-wrapper" style={{ marginBottom: '40px' }}>
                            <div className="post-container">
                                <Skeleton height={850} borderRadius={20} /> 
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- ACTUAL FEED RENDER ---
    return (
        <div className="feed">
            <div className={`feed-layout ${expandedPostId ? 'comments-active' : ''}`}>
                
                <div className="main-screen">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <div key={post.id} className="post-wrapper"> 
                                
                                {/* 1. The Video Content */}
                                <div className="post-container">
                                    <ProductCard 
                                        post={post} 
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                    />                        
                                </div>

                                {/* 2. Action Buttons */}
                                <Engagement 
                                    postId={post.id} 
                                    postTitle={post.title}
                                    userId={post.userId || post.profile?.userId || post.authorId}
                                    onToggleComments={() => toggleComments(post.id)}
                                    IsLikedByCurrentUser={post.isLikedByCurrentUser}
                                    LikeCount={post.likeCount}
                                    CommentCount={post.commentCount ?? post.comments?.length ?? 0}
                                    initialIsBookmarked={post.isBookmarkedByCurrentUser}
                                />

                                {/* 3. The Comment Section (Only shows if this specific post is active) */}
                                {expandedPostId === post.id && (
                                    <CommentSection 
                                        key={`comments-${post.id}`}
                                        postId={post.id}
                                        onClose={() => setExpandedPostId(null)}
                                        isOpen={true}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ color: '#888', textAlign: 'center', marginTop: '50px' }}>
                            <p>No products found matching "{searchQuery}"</p>
                            <button 
                                onClick={() => setSearchQuery("")} 
                                style={{ padding: '8px 16px', borderRadius: '20px', background: '#333', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' }}
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Feed;