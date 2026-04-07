import React, { useState, useEffect } from "react";
import Engagement from "./Engagement";
import ProductCard from "./ProductCard";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import CommentSection from "./CommentSection";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [activePostId, setActivePostId] = useState(null);

    

    // Triggered when the comment icon in Engagement is clicked
    const toggleComments = (postId) => {
        setActivePostId(postId);
        setShowComments(true);
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetching from your C# Backend
                const response = await fetch("https://localhost:7124/api/posts?pageNumber=1&pageSize=10");
                const result = await response.json();
                
                // Assuming your Backend uses a PagedResponse structure where 'data' is the list
                setPosts(result.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching feed:", error);
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // --- LOADING STATE (SKELETONS) ---
    if (loading) {
        return (
            <div className="feed">
                <h6 className="feed-title"><Skeleton width={100} /></h6>
                <div className="feed-layout">
                    <div className="main-screen">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="post-container" style={{ marginBottom: '40px' }}>
                                <Skeleton height={400} borderRadius={20} /> 
                                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ width: '70%' }}>
                                        <Skeleton width="80%" height={24} />
                                        <Skeleton width="40%" height={15} style={{ marginTop: '8px' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <Skeleton circle width={45} height={45} />
                                        <Skeleton circle width={45} height={45} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- ACTUAL FEED RENDER ---
    return (
        <div className="feed">
            <h6 className="feed-title">FlipFeed</h6>
            
            {/* 'comments-active' class can be used in CSS to shrink the main-screen when panel opens */}
            <div className={`feed-layout ${showComments ? 'comments-active' : ''}`}>
                
                <div className="main-screen">
                    {posts.map((post) => (
                        
                        <div key={post.id} className="post-container">
                            {/* The Visual Content */}
                            <ProductCard post={post} />
                            
                            {/* The Action Buttons & Counters */}
                            <Engagement 
                                postId={post.id} 
                               userId={post.userId || post.profile?.userId || post.authorId}
                                onToggleComments={toggleComments}
                                // Passing engagement data from the post DTO
                                IsLikedByCurrentUser={post.isLikedByCurrentUser} 
                                LikeCount={post.likeCount || 0}
                                // Fallback: try commentCount, then comments array length, then 0
                                CommentCount={post.commentCount ?? post.comments?.length ?? 0}
                            />
                        </div>
                    ))}
                </div>

                {/* The Slide-in Comment Panel */}
                {showComments && (
                    <div className="comment-panel">
                        <CommentSection 
                            postId={activePostId}
                            onClose={() => setShowComments(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;