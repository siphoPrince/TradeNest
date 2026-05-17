import { useState, useEffect, useRef } from 'react';
import { CircleX, MessageSquare, Trash2, Edit3, Check, X, Heart, CornerDownRight } from 'lucide-react';
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
    
    // --- EDITS & DELETES STATE ---
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState("");
    const [isActionPending, setIsActionPending] = useState(false);
    
    // --- REPLIES STATE ---
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const [replyText, setReplyText] = useState("");

    // --- TIKTOK DRAG-TO-CLOSE STATES ---
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    
    const startY = useRef(0);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const backendBaseUrl = "https://localhost:7124/uploads/";

    const formatUrl = (url, fallback) => {
        if (!url) return fallback;
        if (url.startsWith("blob:") || url.startsWith("http")) return url;
        return `${backendBaseUrl}${url}`;
    };

    const getCurrentUserId = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            const dotNetId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
            const cleanId = dotNetId || payload.nameid || payload.sub;
            
            return cleanId ? Number(cleanId) : null;
        } catch (e) { 
            return null; 
        }
    };

    const currentUserId = getCurrentUserId();

    // Reset dragging offset coordinates cleanly if the panel closes
    useEffect(() => {
        if (!isOpen) {
            setCurrentY(0);
            setIsDragging(false);
        } else if (inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 300);
        }
    }, [isOpen]);

    // --- TOUCH EVENT HANDLERS (TIKTOK SWIPE CLOSE) ---
    const handleTouchStart = (e) => {
        if (window.innerWidth > 768) return; // Disable gesture handlers on desktop layouts
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const deltaY = e.touches[0].clientY - startY.current;
        
        // Only allow pulling downwards (positive deltaY mappings)
        if (deltaY > 0) {
            setCurrentY(deltaY);
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        // If swiped down past the 140px threshold limit, animate offscreen entirely
        if (currentY > 140) {
            onClose();
        } else {
            // Snap instantly back up into viewport context
            setCurrentY(0);
        }
    };

    useEffect(() => {
        const fetchComments = async () => {
            if (!postId || !isOpen) return;
            setComments([]); 
            setIsLoading(true);

            const token = localStorage.getItem("token");
            const headers = token ? { "Authorization": `Bearer ${token}` } : {};

            try {
                const response = await fetch(`https://localhost:7124/api/comments/post/${postId}`, { headers });
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
                body: JSON.stringify({ content: trimmedText, postId: Number(postId), parentCommentId: null })
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

    const handlePostReply = async (parentCommentId) => {
        const trimmedReplyText = replyText.trim();
        if (!trimmedReplyText || isActionPending) return;
        const token = localStorage.getItem("token");
        if (!token) return alert("Please log in!");

        setIsActionPending(true);
        try {
            const response = await fetch("https://localhost:7124/api/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    content: trimmedReplyText, 
                    postId: Number(postId), 
                    parentCommentId: parentCommentId 
                })
            });

            if (response.ok) {
                const savedReply = await response.json();
                setComments(prev => [...prev, savedReply]);
                setReplyText("");
                setReplyingToCommentId(null);
            }
        } catch (error) {
            console.error("Reply error:", error);
        } finally {
            setIsActionPending(false);
        }
    };

    const handleToggleLike = async (commentId) => {
        const token = localStorage.getItem("token");
        if (!token) return alert("Please log in to like comments!");

        try {
            const response = await fetch(`https://localhost:7124/api/comments/${commentId}/like`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const updatedLikeData = await response.json();
                setComments(prev => prev.map(c => 
                    c.id === commentId 
                        ? { ...c, isLikedByMe: updatedLikeData.isLikedByMe, likesCount: updatedLikeData.likesCount } 
                        : c
                ));
            }
        } catch (err) {
            console.error("Like toggle error:", err);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsActionPending(true);
        try {
            const response = await fetch(`https://localhost:7124/api/comments/${commentId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                if (response.status === 200) {
                    const data = await response.json();
                    if (data && data.isSoftDeleted) {
                        setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: "This comment was deleted." } : c));
                    }
                } else {
                    setComments(prev => prev.filter(c => c.id !== commentId));
                }
                
                if (editingCommentId === commentId) {
                    setEditingCommentId(null);
                    setEditText("");
                }
            }
        } catch (err) { 
            console.error("Delete error:", err); 
        } finally {
            setIsActionPending(false);
        }
    };

    const handleUpdate = async (commentId) => {
        const trimmedEdit = editText.trim();
        if (!trimmedEdit || isActionPending) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsActionPending(true);
        try {
            const response = await fetch(`https://localhost:7124/api/comments/${commentId}`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ content: trimmedEdit })
            });
            if (response.ok) {
                setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: trimmedEdit } : c));
                setEditingCommentId(null);
                setEditText("");
            }
        } catch (err) { 
            console.error("Update error:", err); 
        } finally {
            setIsActionPending(false);
        }
    };

    const handleStartEdit = (comment) => {
        setReplyingToCommentId(null);
        setEditingCommentId(comment.id);
        setEditText(comment.content);
    };

    const mainComments = comments.filter(c => !c.parentCommentId);
    const getRepliesForParent = (parentId) => comments.filter(c => c.parentCommentId === parentId);

    // Apply inline coordinate translations while dragging to overwrite global CSS transforms instantly
    const dynamicMobileStyles = (window.innerWidth <= 768 && isOpen) ? {
        transform: `translateY(${currentY}px)`
    } : {};

    return (
        <div 
            style={dynamicMobileStyles}
            className={`comment-section ${isOpen ? 'is-open' : ''} ${!isDragging ? 'with-transition' : ''}`}
        >
            {/* GESTURE BAR ATTACHED DIRECTLY TO HEADER ROW */}
            <div 
                className="comment-header"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
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
                    mainComments.map((c) => {
                        const replies = getRepliesForParent(c.id);
                        const isMainCommentOwner = currentUserId && (Number(c.userId) === currentUserId);

                        return (
                            <div key={c.id} className="comment-group-wrapper">
                                {/* MAIN COMMENT ITEM */}
                                <div className="comment-item">
                                    <img 
                                        src={formatUrl(c.profilePictureUrl, "https://picsum.photos/120")} 
                                        className="comment-avatar-img" 
                                        alt="" 
                                    />
                                    <div className="comment-body">
                                        <div className="comment-meta">
                                            <div className="meta-left-group">
                                                <span className="comment-author">@{c.handleName || 'user'}</span>
                                                <span className="comment-date">{formatTimeAgo(c.createdAt)}</span>
                                            </div>

                                            {isMainCommentOwner && (
                                                <div className="comment-actions">
                                                    <button 
                                                        className="action-btn"
                                                        disabled={isActionPending}
                                                        onClick={() => handleStartEdit(c)}
                                                    >
                                                        <Edit3 size={14}/>
                                                    </button>
                                                    <button 
                                                        className="action-btn delete-btn"
                                                        disabled={isActionPending}
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
                                                    disabled={isActionPending}
                                                />
                                                <div className="edit-btns">
                                                    <button onClick={() => handleUpdate(c.id)} className="save-btn" disabled={isActionPending}>
                                                        <Check size={16}/>
                                                    </button>
                                                    <button onClick={() => setEditingCommentId(null)} className="cancel-btn" disabled={isActionPending}>
                                                        <X size={16}/>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="comment-text-content">{c.content}</p>
                                                <div className="comment-footer-metrics">
                                                    <button 
                                                        className={`interaction-link-btn ${c.isLikedByMe ? 'liked' : ''}`}
                                                        onClick={() => handleToggleLike(c.id)}
                                                    >
                                                        <Heart size={13} fill={c.isLikedByMe ? "currentColor" : "none"} />
                                                        <span>{c.likesCount}</span>
                                                    </button>
                                                    <button 
                                                        className="interaction-link-btn"
                                                        onClick={() => {
                                                            setEditingCommentId(null);
                                                            setReplyingToCommentId(replyingToCommentId === c.id ? null : c.id);
                                                        }}
                                                    >
                                                        <span>Reply</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {/* INLINE REPLY BOX */}
                                        {replyingToCommentId === c.id && (
                                            <div className="nested-reply-box-input">
                                                <input 
                                                    type="text" 
                                                    placeholder="Write a reply..."
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    disabled={isActionPending}
                                                    autoFocus
                                                />
                                                <button onClick={() => handlePostReply(c.id)} disabled={!replyText.trim() || isActionPending}>Reply</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* CHILD REPLIES STREAM */}
                                {replies.map((reply) => {
                                    const isReplyOwner = currentUserId && (Number(reply.userId) === currentUserId);
                                    
                                    return (
                                        <div key={reply.id} className="comment-item nested-reply-item">
                                            <CornerDownRight size={14} className="reply-arrow-indicator" />
                                            <img 
                                                src={formatUrl(reply.profilePictureUrl, "https://picsum.photos/120")} 
                                                className="comment-avatar-img mini-avatar" 
                                                alt="" 
                                            />
                                            <div className="comment-body">
                                                <div className="comment-meta">
                                                    {/* GROUP THE LEFT ELEMENTS TOGETHER */}
                                                    <div className="meta-left-group">
                                                        <span className="comment-author">@{reply.handleName || 'user'}</span>
                                                        <span className="comment-date">{formatTimeAgo(reply.createdAt)}</span>
                                                    </div>
                                                    
                                                    {/* RIGHT ELEMENT */}
                                                    {isReplyOwner && (
                                                        <div className="comment-actions">
                                                            <button 
                                                                className="action-btn"
                                                                disabled={isActionPending}
                                                                onClick={() => handleStartEdit(reply)}
                                                            >
                                                                <Edit3 size={14}/>
                                                            </button>
                                                            <button 
                                                                className="action-btn delete-btn"
                                                                disabled={isActionPending}
                                                                onClick={() => handleDelete(reply.id)}
                                                            >
                                                                <Trash2 size={14}/>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {editingCommentId === reply.id ? (
                                                    <div className="edit-mode">
                                                        <textarea 
                                                            value={editText} 
                                                            onChange={(e) => setEditText(e.target.value)} 
                                                            className="edit-textarea"
                                                            disabled={isActionPending}
                                                        />
                                                        <div className="edit-btns">
                                                            <button onClick={() => handleUpdate(reply.id)} className="save-btn" disabled={isActionPending}>
                                                                <Check size={16}/>
                                                            </button>
                                                            <button onClick={() => setEditingCommentId(null)} className="cancel-btn" disabled={isActionPending}>
                                                                <X size={16}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="comment-text-content">{reply.content}</p>
                                                        <div className="comment-footer-metrics">
                                                            <button 
                                                                className={`interaction-link-btn ${reply.isLikedByMe ? 'liked' : ''}`}
                                                                onClick={() => handleToggleLike(reply.id)}
                                                            >
                                                                <Heart size={12} fill={reply.isLikedByMe ? "currentColor" : "none"} />
                                                                <span>{reply.likesCount}</span>
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                )}
            </div>

            {/* MAIN POST ENTRY FORM (Shifted out from comment-form styling into optimized markup classes) */}
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
};

export default CommentSection;