import { Heart, MessageCircleMore,ExternalLink,Bookmark,UserPen  } from 'lucide-react';
import { Link } from 'react-router-dom';

const Engagement = ( {userId} ) => {
    return(
        <div className="engagement">

                <Link to={`/profile/${userId}`} className="Profile"><UserPen/></Link>
                <a href="" className="like"><Heart/></a>
                <a href="" className="Comment"><MessageCircleMore /></a>
                <a href="" className="Share"><ExternalLink /></a>
                <a href="" className="Save"><Bookmark  /></a>
        </div>
    );
}

export default Engagement;