import React, { useState, useEffect } from "react";
import Engagement from "./Engagement";
import ProductCard from "./ProductCard";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import CommentSection from "./CommentSection";
import api from "../services/api"; 

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Robust Body Scroll Lock Management
    useEffect(() => {
        if (expandedPostId !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        
        // Cleanup function safely resets scroll rules if the component unmounts unexpectedly
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [expandedPostId]);

    const toggleComments = (postId) => {
        setExpandedPostId(prevId => prevId === postId ? null : postId);
    };

    const handleUpdateCommentCount = (postId, newCount) => {
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post.id === postId 
                    ? { ...post, commentCount: newCount } 
                    : post
            )
        );
    };

    useEffect(() => {
        if (searchQuery) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [searchQuery]);

    // Hook 1: Safely unpacking the updated PagedResponse layout
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get("/api/posts?pageNumber=1&pageSize=10");
                
                // Explicitly unwrap .data from the backend PagedResponse structural wrapper
                const incomingData = response.data?.data;
                setPosts(Array.isArray(incomingData) ? incomingData : []);
            } catch (error) {
                console.error("Error fetching feed:", error);
                setPosts([]); // Graceful fallback state
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Hook 2: Scroll Restoration
    useEffect(() => {
        if (!loading && posts.length > 0) {
            const savedScroll = sessionStorage.getItem("feed-scroll");
            if (savedScroll) {
                const timer = setTimeout(() => {
                    window.scrollTo({
                        top: parseInt(savedScroll, 10),
                        behavior: 'instant' 
                    });
                    sessionStorage.removeItem("feed-scroll");
                }, 300);

                return () => clearTimeout(timer);
            }
        }
    }, [loading, posts]);

    // Hook 3: Global Unmount Interceptor
    useEffect(() => {
        return () => {
            if (window.scrollY > 0) {
                sessionStorage.setItem("feed-scroll", window.scrollY);
            }
        };
    }, []);

    const filteredPosts = posts.filter(post => {
        const query = searchQuery.toLowerCase().trim();
        const basicMatch = 
            post.title?.toLowerCase().includes(query) ||
            post.description?.toLowerCase().includes(query) ||
            (post.handleName || post.name)?.toLowerCase().includes(query);

        const tagMatch = post.tags?.some(tag => 
            tag.name.toLowerCase().includes(query.replace('#', ''))
        );

        return basicMatch || tagMatch;
    });

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

    return (
        <div className="feed">
            <div className={`feed-layout ${expandedPostId ? 'comments-active' : ''}`}>
                <div className="main-screen">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <div key={post.id} className="post-wrapper"> 
                                <div className="post-container">
                                    <ProductCard 
                                        post={post} 
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                    />                        
                                </div>

                                <Engagement 
                                    postId={post.id} 
                                    postTitle={post.title}
                                    userId={post.userId || post.profile?.userId || post.authorId}
                                    onToggleComments={() => toggleComments(post.id)}
                                    IsLikedByCurrentUser={post.isLikedByCurrentUser}
                                    LikeCount={post.likeCount}
                                    CommentCount={post.commentCount ?? post.activeCommentsCount ?? 0}
                                    initialIsBookmarked={post.isBookmarkedByCurrentUser}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="no-posts">No posts found matching criteria.</div>
                    )}
                </div>
            </div>

            <CommentSection 
                postId={expandedPostId}
                isOpen={expandedPostId !== null}
                onClose={() => setExpandedPostId(null)}
                onCommentCountChange={handleUpdateCommentCount}
            />
        </div>
    );
};

export default Feed;