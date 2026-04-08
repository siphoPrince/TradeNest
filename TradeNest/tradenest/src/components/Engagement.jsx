import { MessageCircleMore, ExternalLink, Bookmark, UserPen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Likes from '../pages/Likes';
import { memo } from 'react';

const Engagement = ({ userId, postId, onToggleComments, IsLikedByCurrentUser, LikeCount, CommentCount }) => {
    
    const toggleComments = (e) => {
        e.preventDefault();
        onToggleComments(postId); 
    };

    return (
        <div className="engagement">
            {/* Profile Link */}
            <div className="engagement-item">
                <Link to={`/profile/${userId}`} className="Profile"><UserPen size={22}/></Link>
            </div>

            {/* Likes Component (Assuming Likes handles its own count display or we pass it) */}
            <div className="engagement-item">
                <Likes 
                    postId={postId} 
                    initialIsLiked={IsLikedByCurrentUser} 
                    initialLikeCount={LikeCount} 
                />
                {/* If Likes.jsx doesn't show the number, you can add <small>{LikeCount}</small> here */}
            </div>

            {/* Comments */}
            <div className="engagement-item">
                <button className="engagement-btn" onClick={toggleComments}>
                    <MessageCircleMore size={22} />
                </button>
                <span className="count-label">{CommentCount}</span>
            </div>

            {/* Share */}
            <div className="engagement-item">
                <a href="#" className="Share" onClick={(e) => e.preventDefault()}><ExternalLink size={22} /></a>
                <span className="count-label">Share</span>
            </div>

            {/* Save */}
            <div className="engagement-item">
                <a href="#" className="Save" onClick={(e) => e.preventDefault()}><Bookmark size={22} /></a>
            </div>
        </div>
    );
}

export default memo(Engagement); 