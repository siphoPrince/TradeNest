import { Heart, MessageCircleMore,ExternalLink,Bookmark,UserPen  } from 'lucide-react';

const Engagement = () => {
    return(
        <div className="engagement">
                <a href="" className="Profile"><UserPen/></a>
                <a href="" className="like"><Heart/></a>
                <a href="" className="Comment"><MessageCircleMore /></a>
                <a href="" className="Share"><ExternalLink /></a>
                <a href="" className="Save"><Bookmark  /></a>
        </div>
    );
}

export default Engagement;