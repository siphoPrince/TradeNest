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

    // Triggered when the comment icon in Engagement is clicked
    const toggleComments = (postId) => {
        if (expandedPostId === postId) {
            // If already open for this post, close it
            setExpandedPostId(null);
        } else {
            // Open for the clicked post
            setExpandedPostId(postId);
        }
    };

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
            {/* We use a dynamic class so the whole layout can shift if needed */}
            <div className={`feed-layout ${expandedPostId ? 'comments-active' : ''}`}>
                
                <div className="main-screen">
                    {posts.map((post) => (
                        <div key={post.id} className="post-wrapper"> 
                            
                            {/* 1. The Video Content */}
                            <div className="post-container">
                                <ProductCard post={post} />                         
                            </div>

                            {/* 2. Action Buttons */}
                            <Engagement 
                                postId={post.id} 
                                userId={post.userId || post.profile?.userId || post.authorId}
                                onToggleComments={() => toggleComments(post.id)}
                                IsLikedByCurrentUser={post.isLikedByCurrentUser}
                                LikeCount={post.likeCount}
                                CommentCount={post.commentCount ?? post.comments?.length ?? 0}
                            />

                            {/* 3. The Comment Section (Only shows if this specific post is active) */}
                            {expandedPostId === post.id && (
                                <CommentSection 
                                    postId={post.id}
                                    onClose={() => setExpandedPostId(null)}
                                />
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Feed;