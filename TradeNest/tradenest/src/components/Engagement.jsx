import {  MessageCircleMore,ExternalLink,Bookmark,UserPen  } from 'lucide-react';
import { Link } from 'react-router-dom';

import Likes from '../pages/Likes';

const Engagement = ( {userId, postId, onToggleComments,IsLikedByCurrentUser, LikeCount} ) => {
    console.log("Engagement received userId:", userId);
    const toggleComments = (e) => {
        e.preventDefault();
        onToggleComments(postId); 
    };
    return(
        <>
        <div className="engagement">

                <Link to={`/profile/${userId}`} className="Profile"><UserPen/></Link>
                <Likes 
                        postId={postId} 
                        initialIsLiked={IsLikedByCurrentUser} 
                        initialLikeCount={LikeCount} 
                    />
                <a href="" className="Comment" onClick={toggleComments}><MessageCircleMore /></a>
                <a href="" className="Share"><ExternalLink /></a>
                <a href="" className="Save"><Bookmark  /></a>
        </div>
        
    </>
    );
}

export default Engagement;