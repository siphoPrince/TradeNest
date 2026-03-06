import { Heart, MessageCircleMore,ExternalLink   } from 'lucide-react';

const Engagement = () => {
    return(
        <div className="engagement">
            <div className="container">
                <a href="" className="like"><Heart/></a>
                <a href="" className="Comment"><MessageCircleMore /></a>
                <a href="" className="Share"><ExternalLink /></a>
            </div>
        </div>
    );
}