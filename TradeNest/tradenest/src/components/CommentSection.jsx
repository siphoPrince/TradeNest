import { useState, useEffect } from 'react';
import { CircleX } from 'lucide-react';
import "../styles/CommentSection.css"

const CommentSection = ( {userId, postId, onClose} ) => {

    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);

    const handleInputChange = (e) => {
        setCommentText(e.target.value);
    };

    useEffect(() => {
    const fetchComments = async () => {
        try {
            const response = await fetch(`https://localhost:7124/api/comments/post/${postId}`);
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    if (postId) {
            fetchComments();
        }
}, [postId]);


const handlePostComment = async () => {
    // 1. Get the token from storage
    const token = localStorage.getItem("token"); 

    const newComment = {
        content: commentText,
        postId: postId,
        // userId is handled by the backend token!
    };

    try {
        const response = await fetch("https://localhost:7124/api/comments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Use the token here 🛡️
            },
            body: JSON.stringify(newComment)
        });

        if (response.ok) {
            const savedComment = await response.json();
            setComments([savedComment, ...comments]);
            setCommentText("");
        }
    } catch (error) {
        console.error("Error posting comment:", error);
    }
};

    return (
        <div className="comment-section">
            {/* 1. The Input Form */}
            <div className="comment-form">
                <div className="comment-header">
                    <span>{comments.length} comments</span>
                    <button className="close-button" onClick={onClose}><CircleX/></button>
                </div>
                <textarea 
                    placeholder="Write a comment..."
                    value={commentText} 
                    onChange={(e) => setCommentText(e.target.value)} 
    
                />
                {/* Disable button if text is just whitespace */}
                <button 
                    onClick={handlePostComment} 
                    disabled={!commentText.trim()}
                >
                    Post Comment
                </button>
            </div>

            

            {/* 2. The List Area */}
            <div className="comments-list">
                {comments.length === 0 ? (
                    <p>No comments yet. Be the first to say something! 💬</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment-item" >
                            <p>{comment.content}</p>
                            <small>
                                {comment.createdAt 
                                    ? new Date(comment.createdAt).toLocaleString() 
                                    : "Just now"}
                            </small>
        
                        </div>
                    ))
                )}
            </div>
        </div>
);
}

export default CommentSection