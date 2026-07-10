import { useState, useEffect, useRef, useMemo } from 'react';
import { CircleX, MessageSquare, Trash2, Edit3, Check, X, Heart, CornerDownRight } from 'lucide-react';
import Toast from './Toast'; // Adjust path if necessary to point to your Toast file
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

const CommentSection = ({ postId, onClose, isOpen, onCommentCountChange }) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // --- EDITS & DELETES STATE ---
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState("");
    const [isActionPending, setIsActionPending] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null); // Modern alternative to window.confirm
    
    // --- TOAST STATE ---
    const [toast, setToast] = useState(null); // Format: { message: string, type: "success" | "error" | "info" }

    // --- REPLIES STATE ---
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const [replyText, setReplyText] = useState("");

    // --- TIKTOK DRAG-TO-CLOSE STATES ---
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    
    const startY = useRef(0);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const backendBaseUrl = "https://cylosocials.co.za/uploads/";

    const formatUrl = (url, fallback) => {
        if (!url) return fallback;
        if (url.startsWith("blob:") || url.startsWith("http")) return url;
        return `${backendBaseUrl}${url}`;
    };

    // Helper to trigger premium custom toasts seamlessly
    const triggerToast = (message, type = "error") => {
        setToast({ message, type });
    };

    // Extract User ID safely inside useMemo to minimize redundant token decoding operations
    const currentUserId = useMemo(() => {
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
    }, [isOpen]);

    // Compute active visible comments safely for local UI metrics
    const activeCommentsCount = useMemo(() => {
        return comments.filter(c => c.content !== "This comment was deleted.").length;
    }, [comments]);

    // Track state mutations cleanly when panel transitions visibility status
    useEffect(() => {
        if (!isOpen) {
            setCurrentY(0);
            setIsDragging(false);
            setConfirmDeleteId(null);
        } else if (inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 300);
        }
    }, [isOpen]);

    // --- TOUCH EVENT HANDLERS (TIKTOK SWIPE CLOSE) ---
    const handleTouchStart = (e) => {
        if (window.innerWidth > 768) return; 
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const deltaY = e.touches[0].clientY - startY.current;
        if (deltaY > 0) {
            setCurrentY(deltaY);
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (currentY > 140) {
            onClose();
        } else {
            setCurrentY(0);
        }
    };

    // Helper to safely notify the parent of a clean metric change
    const syncCountToParent = (updatedCommentsList) => {
        if (typeof onCommentCountChange === 'function') {
            const freshCount = updatedCommentsList.filter(c => c.content !== "This comment was deleted.").length;
            onCommentCountChange(postId, freshCount);
        }
    };

    // --- API INTERACTIONS ---
    useEffect(() => {
        const fetchComments = async () => {
            if (!postId) return;
            
            if (isOpen) setIsLoading(true);

            const token = localStorage.getItem("token");
            const headers = {
                "Accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            };

            try {
                const response = await fetch(`https://cylosocials.co.za/api/comments/post/${postId}`, { 
                    method: "GET",
                    headers 
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const cleanData = Array.isArray(data) ? data : [];
                    setComments(cleanData);
                    syncCountToParent(cleanData);
                } else {
                    console.warn(`Backend returned status code: ${response.status}`);
                    setComments([]);
                }
            } catch (error) {
                console.error("Network link failure fetching comments:", error);
                setComments([]);
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
        if (!token) {
            triggerToast("Please log in to add a comment.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("https://cylosocials.co.za/api/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: trimmedText, postId: Number(postId), parentCommentId: null })
            });

            if (response.ok) {
                const savedComment = await response.json();
                setComments(prev => {
                    const nextComments = [savedComment, ...prev];
                    syncCountToParent(nextComments);
                    return nextComments;
                });
                setCommentText("");
                triggerToast("Comment posted!", "success");
                scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                triggerToast("Failed to post comment. Try again.", "error");
            }
        } catch (error) {
            console.error("Submit error:", error);
            triggerToast("Network link error.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePostReply = async (parentCommentId) => {
        const trimmedReplyText = replyText.trim();
        if (!trimmedReplyText || isActionPending) return;
        const token = localStorage.getItem("token");
        if (!token) {
            triggerToast("Please log in to reply.", "error");
            return;
        }

        setIsActionPending(true);
        try {
            const response = await fetch("https://cylosocials.co.za/api/comments", {
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
                setComments(prev => {
                    const nextComments = [...prev, savedReply];
                    syncCountToParent(nextComments);
                    return nextComments;
                });
                setReplyText("");
                setReplyingToCommentId(null);
                triggerToast("Reply posted successfully!", "success");
            } else {
                triggerToast("Failed to submit reply.", "error");
            }
        } catch (error) {
            console.error("Reply error:", error);
            triggerToast("Something went wrong.", "error");
        } finally {
            setIsActionPending(false);
        }
    };

    const handleToggleLike = async (commentId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            triggerToast("Please log in to like comments!", "error");
            return;
        }

        try {
            const response = await fetch(`https://cylosocials.co.za/api/comments/${commentId}/like`, {
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
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsActionPending(true);
        try {
            const response = await fetch(`https://cylosocials.co.za/api/comments/${commentId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                if (response.status === 200) {
                    const data = await response.json();
                    if (data && data.isSoftDeleted) {
                        setComments(prev => {
                            const nextComments = prev.map(c => c.id === commentId ? { ...c, content: "This comment was deleted." } : c);
                            syncCountToParent(nextComments);
                            return nextComments;
                        });
                    }
                } else {
                    setComments(prev => {
                        const nextComments = prev.filter(c => c.id !== commentId);
                        syncCountToParent(nextComments);
                        return nextComments;
                    });
                }
                
                triggerToast("Comment deleted cleanly.", "success");

                if (editingCommentId === commentId) {
                    setEditingCommentId(null);
                    setEditText("");
                }
                setConfirmDeleteId(null);
            } else {
                triggerToast("Unable to delete comment.", "error");
            }
        } catch (err) { 
            console.error("Delete error:", err); 
            triggerToast("Network request failed.", "error");
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
            const response = await fetch(`https://cylosocials.co.za/api/comments/${commentId}`, {
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
                triggerToast("Comment updated!", "success");
            } else {
                triggerToast("Failed to edit comment.", "error");
            }
        } catch (err) { 
            console.error("Update error:", err); 
            triggerToast("Connection error.", "error");
        } finally {
            setIsActionPending(false);
        }
    };

    const handleStartEdit = (comment) => {
        setReplyingToCommentId(null);
        setConfirmDeleteId(null);
        setEditingCommentId(comment.id);
        setEditText(comment.content);
    };

    const mainComments = useMemo(() => comments.filter(c => !c.parentCommentId), [comments]);
    const getRepliesForParent = (parentId) => comments.filter(c => c.parentCommentId === parentId);

    // --- FIX: Prevent rendering on desktop entirely if not open ---
    if (!isOpen && window.innerWidth > 768) {
        return null;
    }

    const dynamicMobileStyles = (window.innerWidth <= 768 && isOpen) ? {
        transform: `translateY(${currentY}px)`
    } : {};

    return (
        <div 
            style={dynamicMobileStyles}
            className={`comment-section ${isOpen ? 'is-open' : ''} ${!isDragging ? 'with-transition' : ''}`}
        >
            {/* Custom Premium Toast Component Rendering inside layout */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            <div 
                className="comment-header"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="header-info">
                    <MessageSquare size={18} className="header-icon" />
                    <span>{activeCommentsCount} comments</span>
                </div>
                <button className="close-button" onClick={onClose}>
                    <CircleX size={22}/>
                </button>
            </div>

            <div className="comments-list" ref={scrollRef}>
                {isLoading && isOpen ? (
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
                                                    {confirmDeleteId === c.id ? (
                                                        <div className="inline-delete-confirm-flow">
                                                            <button 
                                                                className="confirm-action-btn check-confirm"
                                                                onClick={() => handleDelete(c.id)}
                                                                disabled={isActionPending}
                                                                title="Confirm Delete"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                            <button 
                                                                className="confirm-action-btn cancel-confirm"
                                                                onClick={() => setConfirmDeleteId(null)}
                                                                disabled={isActionPending}
                                                                title="Cancel"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
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
                                                                onClick={() => {
                                                                    setEditingCommentId(null);
                                                                    setConfirmDeleteId(c.id);
                                                                }}
                                                            >
                                                                <Trash2 size={14}/>
                                                            </button>
                                                        </>
                                                    )}
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
                                                            setConfirmDeleteId(null);
                                                            setReplyingToCommentId(replyingToCommentId === c.id ? null : c.id);
                                                        }}
                                                    >
                                                        <span>Reply</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}

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
                                                    <div className="meta-left-group">
                                                        <span className="comment-author">@{reply.handleName || 'user'}</span>
                                                        <span className="comment-date">{formatTimeAgo(reply.createdAt)}</span>
                                                    </div>
                                                    
                                                    {isReplyOwner && (
                                                        <div className="comment-actions">
                                                            {confirmDeleteId === reply.id ? (
                                                                <div className="inline-delete-confirm-flow">
                                                                    <button 
                                                                        className="confirm-action-btn check-confirm"
                                                                        onClick={() => handleDelete(reply.id)}
                                                                        disabled={isActionPending}
                                                                    >
                                                                        <Check size={14} />
                                                                    </button>
                                                                    <button 
                                                                        className="confirm-action-btn cancel-confirm"
                                                                        onClick={() => setConfirmDeleteId(null)}
                                                                        disabled={isActionPending}
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
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
                                                                        onClick={() => {
                                                                            setEditingCommentId(null);
                                                                            setConfirmDeleteId(reply.id);
                                                                        }}
                                                                    >
                                                                        <Trash2 size={14}/>
                                                                    </button>
                                                                </>
                                                            )}
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