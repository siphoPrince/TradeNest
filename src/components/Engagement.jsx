import { MessageCircleMore, ExternalLink, Bookmark, UserPen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Likes from '../pages/Likes';
import { memo, useState, useEffect } from 'react';

const Engagement = ({ 
    userId, 
    postId, 
    postTitle, 
    onToggleComments, 
    IsLikedByCurrentUser, 
    LikeCount, 
    CommentCount, // Ensure this matches what the parent passes!
    initialIsBookmarked 
}) => {
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked ?? false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Track comment count locally so changes up the tree sync dynamically
    const [localCommentCount, setLocalCommentCount] = useState(CommentCount ?? 0);

    const saveScroll = () => {
        sessionStorage.setItem("feed-scroll", window.scrollY);
    };

    // Keep the local count updated if the parent changes it (e.g., activeCommentsCount changes)
    useEffect(() => {
        setLocalCommentCount(CommentCount ?? 0);
    }, [CommentCount]);

    useEffect(() => {
        setIsBookmarked(initialIsBookmarked ?? false);
    }, [initialIsBookmarked]);

    const handleShare = async (e) => {
        e.preventDefault();
        saveScroll();

        const shareUrl = `${window.location.origin}/post/${postId}`;
        const shareData = {
            title: postTitle || "Check out this listing on Cylo",
            text: `Take a look at this listing on Cylo!`,
            url: shareUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Share cancelled or failed", err);
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard!");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (isSaving) return;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please sign in to save listings.");
            return;
        }

        setIsSaving(true);
        const previousState = isBookmarked;
        setIsBookmarked(!previousState);

        try {
            const response = await fetch(`https://cylosocials.co.za/api/bookmarks/${postId}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error("Failed to save");
            
            const data = await response.json();
            setIsBookmarked(data.isBookmarked);
            
        } catch (err) {
            console.error("Save error:", err);
            setIsBookmarked(previousState);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="engagement">
            <div className="engagement-item">
                <Link to={`/profile/${userId}`} className="engagement-link" onClick={saveScroll}>
                    <UserPen size={22} className="engagement-icon" />
                </Link>
            </div>

            <div className="engagement-item">
                <Likes 
                    postId={postId} 
                    initialIsLiked={IsLikedByCurrentUser ?? false} 
                    initialLikeCount={LikeCount ?? 0} 
                />
            </div>

            <div className="engagement-item">
                <button className="engagement-btn" onClick={(e) => { e.preventDefault(); onToggleComments(postId); }}>
                    <MessageCircleMore size={22} className="engagement-icon" />
                </button>
                {/* Use local state to handle real-time rendering accurately */}
                <span className="count-label">{localCommentCount}</span>
            </div>

            <div className="engagement-item">
                <button className="engagement-btn" onClick={handleShare}>
                    <ExternalLink size={22} className="engagement-icon" />
                </button>
                <span className="count-label">Share</span>
            </div>

            <div className="engagement-item">
                <button 
                    className={`engagement-btn ${isBookmarked ? 'active' : ''}`} 
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    <Bookmark 
                        size={22} 
                        className="engagement-icon" 
                        fill={isBookmarked ? "var(--color-primary)" : "none"} 
                        color={isBookmarked ? "var(--color-primary)" : "currentColor"}
                    />
                </button>
                <span className="count-label">{isBookmarked ? 'Saved' : 'Save'}</span>
            </div>
        </div>
    );
}

export default memo(Engagement);