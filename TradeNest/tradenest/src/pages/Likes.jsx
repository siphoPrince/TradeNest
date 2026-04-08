import {Heart} from 'lucide-react';
import { useState, useEffect } from 'react';

const Likes=({ postId, initialIsLiked = false, initialLikeCount = 0 })=>{
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

        const newLikedState = !wasLikedBeforeClick;

    
        setIsLiked(!wasLikedBeforeClick);
        setLikeCount(prev => !wasLikedBeforeClick ? prev + 1 : prev - 1);


        try {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://localhost:7124/api/likes/toggle/${postId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    // 3. If the server fails, we need to roll back the UI
                    throw new Error("Failed to sync with server");
                }

                const data = await response.json();
                setIsLiked(data.isLiked);
                setLikeCount(data.likeCount);
            } catch (error) {
                
                setIsLiked(wasLikedBeforeClick);
                setLikeCount(previousCount);
                console.error("Error updating like:", error);
            }
    };


    return (
            <div className="LikeAction"> {/* 1. The outer container */}
                <button 
                    onClick={handleLike} 
                    className="like-icon-btn" // 2. This becomes the circle
                >
                    <Heart 
                        fill={isLiked ? "red" : "none"} 
                        color={isLiked ? "red" : "black"} 
                    />
                </button>
                <span className="like-count" style={{ color: 'black' }}>{likeCount}</span> 
            </div>
        );

}

export default Likes