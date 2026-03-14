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

    const toggleComments = (postId) => {
    setActivePostId(postId);
    setShowComments(true);
};

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Adjust the URL/Port to match your running C# Backend
                const response = await fetch("https://localhost:7124/api/posts?pageNumber=1&pageSize=10");
                const result = await response.json();
                
                // result.data contains the list of posts from your PagedResponse
                setPosts(result.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching feed:", error);
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading){
        return (
            <div className="feed">
                <h6 className="feed-title"><Skeleton width={100} /></h6>
                <div className="feed-layout">
                    <div className="main-screen">
                        {/* We render 3 skeleton "ghost" posts */}
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="post-container" style={{ marginBottom: '20px' }}>
                                {/* Skeleton for ProductCard */}
                                <Skeleton height={250} borderRadius={15} /> 
                                <div style={{ marginTop: '10px' }}>
                                    <Skeleton width="60%" height={20} />
                                    <Skeleton width="40%" height={15} />
                                </div>
                                {/* Skeleton for Engagement buttons */}
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <Skeleton circle width={40} height={40} />
                                    <Skeleton circle width={40} height={40} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );}

        return (
                <div className="feed">
                    <h6 className="feed-title">FlipFeed</h6>
                    {/* We add the dynamic class here so the CSS knows to shift the layout */}
                    <div className={`feed-layout ${showComments ? 'comments-active' : ''}`}>
                        <div className="main-screen">
                            {posts.map((post) => (
                                <div key={post.id} className="post-container">
                                    <ProductCard post={post} />
                                    {/* We pass toggleComments here so Engagement can trigger it */}
                                    <Engagement 
                                        postId={post.id} 
                                        userId={post.userId} 
                                        onToggleComments={toggleComments} 
                                    />
                                </div>
                            ))}
                        </div>

                        {/* This is your right-side panel that slides in */}
                        {showComments && (
                            <div className="comment-panel">
                                <CommentSection 
                                postId={activePostId}
                                onClose={() => setShowComments(false)}/>
                            </div>
                        )}
                    </div>
                </div>
            );
    
};

export default Feed;