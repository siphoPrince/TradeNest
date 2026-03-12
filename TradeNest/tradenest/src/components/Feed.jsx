import React, { useState, useEffect } from "react";
import Engagement from "./Engagement";
import ProductCard from "./ProductCard";
// Remove static Picture import once using live data

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showComments, setShowComments] = useState(false);

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

    if (loading) return <div className="loader">Loading FlipFeed... 🚀</div>;

    return (
        <div className="feed">
            <h6 className="feed-title">FlipFeed</h6>
            <div className="feed-layout">
                <div className="main-screen">
                    {/* Map through the posts from the database */}
                    {posts.map((post) => (
                        <div key={post.id} className="post-container">
                            {/* We'll pass the whole post object to the card */}
                            <ProductCard post={post} />
                            <Engagement postId={post.id} userId={post.userId} />
                        </div>
                    ))}
                </div>

                {showComments && (
                    <div className="comment-panel">
                        <button onClick={() => setShowComments(false)}>Close</button>
                        <p>Comments for this post...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;