import { useState } from "react";
import Engagement from "./Engagement";
import ProductCard from "./ProductCard";
import Picture from "../assets/hoddie.jpg";

const Feed = () =>{

    const [showComments, setShowComments] = useState(false);
    return(
        <div className="feed">
            <h6 className="feed-title">FlipFeed</h6>
            <div className="feed-layout">
                {/* CENTER VIDEO AREA */}
                <div className="main-screen">
                <img
                    src={Picture}
                    alt="Product demo"
                    className="feed-media"
                />
                <Engagement />
                <ProductCard/>
                </div>

                {/* RIGHT COMMENT PANEL */}
                {showComments && (
                    <div className="comment-panel">
                        <button onClick={() => setShowComments(false)}>
                            Close
                        </button>

                        comments will go here
                    </div>
                )}                

            </div>

        </div>
    );
}

export default Feed;