import { useState, useEffect } from 'react';
import { CircleX, Send } from 'lucide-react';
import "../styles/CommentSection.css";

const CommentSection = ({ userId, postId, onClose }) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const backendBaseUrl = "https://localhost:7124/uploads/";

    // URL Formatter logic synced with your ProductCard
    const formatUrl = (url, fallback) => {
        if (!url) return fallback;
        if (url.startsWith("blob:") || url.startsWith("http")) return url;
        return `${backendBaseUrl}${url}`;
    };

    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`https://localhost:7124/api/comments/post/${postId}`);
                if (response.ok) {
                    const data = await response.json();
                    setComments(data);
                }
            } catch (error) {
                console.error("Error fetching comments:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (postId) fetchComments();
    }, [postId]);

    const handlePostComment = async () => {
        const token = localStorage.getItem("token");
        const newComment = { content: commentText, postId: postId };

        try {
            const response = await fetch("https://localhost:7124/api/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newComment)
            });

            if (response.ok) {
                const savedComment = await response.json();
                // Add new comment to top
                setComments([savedComment, ...comments]);
                setCommentText("");
            }
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };

    return (
        <div className="comment-section">
            <div className="comment-header">
                <span>{comments.length} comments</span>
                <button className="close-button" onClick={onClose}>
                    <CircleX size={20}/>
                </button>
            </div>

            <div className="comments-list">
                {isLoading ? (
                    <div className="status-message">Loading...</div>
                ) : comments.length === 0 ? (
                    <div className="status-message">
                        <p>No comments yet. Be the first to say something! 💬</p>
                    </div>
                ) : (
                    comments.map((comment) => {
                        // 1. Try to find the Image in all possible spots (Nested vs Flat)
                        const profileImgName = 
                            comment.profile?.imageUrl || 
                            comment.user?.profile?.imageUrl || 
                            comment.profilePictureUrl || 
                            comment.user?.imageUrl;

                        const profileUrl = formatUrl(profileImgName, "https://picsum.photos/120");

                        // 2. Try to find the Username/Handle in all possible spots
                        const displayName = 
                            comment.profile?.handleName || 
                            comment.user?.handleName || 
                            comment.handleName || 
                            comment.userName || 
                            comment.user?.userName || 
                            "user";

                        return (
                            <div key={comment.id} className="comment-item">
                                <img 
                                    src={profileUrl} 
                                    className="comment-avatar-img" 
                                    alt="User" 
                                    onError={(e) => { e.target.src = "https://picsum.photos/120"; }}
                                />
                                <div className="comment-body">
                                    <div className="comment-meta">
                                        <span className="comment-author">@{displayName}</span>
                                        <small>
                                            {comment.createdAt 
                                                ? new Date(comment.createdAt).toLocaleDateString() 
                                                : "Just now"}
                                        </small>
                                    </div>
                                    <p className="comment-text-content">{comment.content}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="comment-form">
                <textarea 
                    placeholder="Write a comment..."
                    value={commentText} 
                    onChange={(e) => setCommentText(e.target.value)} 
                />
                <button 
                    onClick={handlePostComment} 
                    disabled={!commentText.trim()}
                >
                    <Send size={14} style={{marginRight: '6px'}}/>
                    Post
                </button>
            </div>
        </div>
    );
}

export default CommentSection;