import { useState, useEffect, useRef } from 'react';
import { CircleX, MessageSquare, Trash2, Edit3, Check, X } from 'lucide-react';
import "../styles/CommentSection.css";

const formatTimeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const now = new Date();
    const then = new Date(dateString);
    const seconds = Math.floor((now - then) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return then.toLocaleDateString();
};

const CommentSection = ({ postId, onClose, isOpen }) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState("");
    
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const backendBaseUrl = "https://localhost:7124/uploads/";

    const formatUrl = (url, fallback) => {
        if (!url) return fallback;
        if (url.startsWith("blob:") || url.startsWith("http")) return url;
        return `${backendBaseUrl}${url}`;
    };

    // --- IDENTIFICATION LOGIC ---
    const getCurrentUserId = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            // Your C# Backend uses NameIdentifier -> nameid
            // We also check 'sub' as a fallback
            return payload.nameid || payload.sub; 
        } catch (e) { return null; }
    };

    const currentUserId = getCurrentUserId();

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 300);
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchComments = async () => {
            if (!postId || !isOpen) return;
            setComments([]); 
            setIsLoading(true);

            try {
                const response = await fetch(`https://localhost:7124/api/comments/post/${postId}`);
                if (response.ok) {
                    const data = await response.json();
                    setComments(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchComments();
    }, [postId, isOpen]);

    const handlePostComment = async () => {
        const trimmedText = commentText.trim();
        if (!trimmedText || isSubmitting) return;
        const token = localStorage.getItem("token");
        if (!token) return alert("Please log in!");

        setIsSubmitting(true);
        try {
            const response = await fetch("https://localhost:7124/api/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: trimmedText, postId: Number(postId) })
            });

            if (response.ok) {
                const savedComment = await response.json();
                setComments(prev => [savedComment, ...prev]);
                setCommentText("");
                scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error("Submit error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`https://localhost:7124/api/comments/${commentId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                setComments(prev => prev.filter(c => c.id !== commentId));
            }
        } catch (err) { console.error("Delete error:", err); }
    };

    const handleUpdate = async (commentId) => {
        if (!editText.trim()) return;
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`https://localhost:7124/api/comments/${commentId}`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(editText) 
            });
            if (response.ok) {
                setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editText } : c));
                setEditingCommentId(null);
            }
        } catch (err) { console.error("Update error:", err); }
    };

    return (
        <div className={`comment-section ${isOpen ? 'is-open' : ''}`}>
            <div className="comment-header">
                <div className="header-info">
                    <MessageSquare size={18} className="header-icon" />
                    <span>{comments.length} comments</span>
                </div>
                <button className="close-button" onClick={onClose}>
                    <CircleX size={22}/>
                </button>
            </div>

            <div className="comments-list" ref={scrollRef}>
                {isLoading ? (
                    <div className="status-message"><div className="cylo-spinner"></div></div>
                ) : comments.length === 0 ? (
                    <div className="status-message empty-state">
                        <div className="empty-icon">💬</div>
                        <p>No comments yet</p>
                    </div>
                ) : (
                    comments.map((c) => (
                        <div key={c.id || Math.random()} className="comment-item">
                            <img 
                                src={formatUrl(c.profilePictureUrl, "https://picsum.photos/120")} 
                                className="comment-avatar-img" 
                                alt="" 
                            />
                            <div className="comment-body">
                                <div className="comment-meta">
                                    <span className="comment-author">@{c.handleName || 'user'}</span>
                                    <span className="comment-date">{formatTimeAgo(c.createdAt)}</span>

                                    {/* AUTHORIZATION CHECK: Normalizing ID types to String */}
                                    {currentUserId && String(c.userId) === String(currentUserId) && (
                                        <div className="comment-actions">
                                            <button 
                                                className="action-btn"
                                                onClick={() => { setEditingCommentId(c.id); setEditText(c.content); }}
                                            >
                                                <Edit3 size={14}/>
                                            </button>
                                            <button 
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(c.id)}
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editingCommentId === c.id ? (
                                    <div className="edit-mode">
                                        <textarea 
                                            value={editText} 
                                            onChange={(e) => setEditText(e.target.value)} 
                                            className="edit-textarea"
                                        />
                                        <div className="edit-btns">
                                            <button onClick={() => handleUpdate(c.id)} className="save-btn">
                                                <Check size={16}/>
                                            </button>
                                            <button onClick={() => setEditingCommentId(null)} className="cancel-btn">
                                                <X size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="comment-text-content">{c.content}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="comment-form">
                <div className="input-wrapper">
                    <textarea 
                        ref={inputRef}
                        placeholder="Add a comment..."
                        value={commentText} 
                        onChange={(e) => setCommentText(e.target.value)} 
                        disabled={isSubmitting}
                    />
                </div>
                <button 
                    className={`post-btn ${commentText.trim() ? 'active' : ''}`}
                    onClick={handlePostComment} 
                    disabled={!commentText.trim() || isSubmitting}
                >
                    {isSubmitting ? <div className="small-spinner"></div> : "Post"}
                </button>
            </div>
        </div>
    );
}

export default CommentSection;