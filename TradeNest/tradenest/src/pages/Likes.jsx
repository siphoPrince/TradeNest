import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api'; // 1. IMPORT: Bring in your custom axios instance (verify path)

const Likes = ({ postId, initialIsLiked = false, initialLikeCount = 0 }) => {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    
    useEffect(() => {
        setIsLiked(initialIsLiked);
        setLikeCount(initialLikeCount);
    }, [initialIsLiked, initialLikeCount]);

    const handleLike = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            alert("Please log in to like posts!");
            return;
        }

        const wasLikedBeforeClick = isLiked; 
        const previousCount = likeCount;

        // Optimistic UI update for immediate response feel
        setIsLiked(!wasLikedBeforeClick);
        setLikeCount(prev => !wasLikedBeforeClick ? prev + 1 : prev - 1);

        try {
            // 2. SWAP: Use your api instance. No need for hardcoded domain or manual headers!
            const response = await api.post(`/api/likes/toggle/${postId}`);

            // Axios automatically treats non-2xx status codes as errors, throwing to catch block.
            // We can directly grab data off the response object.
            const data = response.data;
            setIsLiked(data.isLiked);
            setLikeCount(data.likeCount);
        } catch (error) {
            // Fallback rollback state on network errors
            setIsLiked(wasLikedBeforeClick);
            setLikeCount(previousCount);
            console.error("Error updating like:", error);
        }
    };

    return (
        <div className={`LikeAction ${isLiked ? 'liked' : ''}`}>
            <button 
                onClick={handleLike} 
                className="like-icon-btn"
                type="button"
            >
                <Heart 
                    size={22}
                    className="engagement-icon" 
                    fill={isLiked ? "var(--color-danger)" : "none"} 
                    color={isLiked ? "var(--color-danger)" : "currentColor"} 
                />
            </button>
            <span className="count-label like-count" style={{ fontSize: "18px", fontWeight: "400" }}>
                {likeCount}
            </span>
        </div>
    );
};

export default Likes;