import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BaggageClaim } from 'lucide-react';

const ProductCard = ({ post }) => {
  const videoRef = useRef(null);
  if (!post) return null;

  // 1. Setup URLs
  const isVideo = post.mediaUrl?.match(/\.(mp4|webm|mov|ogg)$/i);
  const backendBaseUrl = "https://localhost:7124/uploads/";
  const mediaUrl = post.mediaUrl ? `${backendBaseUrl}${post.mediaUrl}` : "/placeholder-product.jpg";
  const profileUrl = post.profilePictureUrl ? `${backendBaseUrl}${post.profilePictureUrl}` : "/profile.jpg";

  // 2. TikTok Auto-play Logic
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {}); // Play when visible
        } else {
          videoRef.current.pause(); // Pause when scrolled away
        }
      },
      { threshold: 0.6 } // Plays when 60% of the card is on screen
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [isVideo]);

  return (
    <div className="post-container"> 
      {/* 1. Dynamic Media - Switches between Video and Image */}
      {isVideo ? (
        <video 
          ref={videoRef}
          src={mediaUrl} 
          className="feed-media"
          loop 
          muted 
          playsInline
          onClick={(e) => e.target.paused ? e.target.play() : e.target.pause()}
        />
      ) : (
        <img 
          src={mediaUrl} 
          alt={post.title} 
          className="feed-media"
          onError={(e) => { e.target.src = "/placeholder-product.jpg"; }}
        />
      )}

      {/* 2. Info Overlay */}
      <div className="productInfo">
        <div className="profileInfo">
          <img 
            src={profileUrl} 
            className="profile-pic" 
            alt="User" 
          />
          <span>@{post.handleName || post.name || "User"}</span>
        </div>

        <div className="description">
          <strong>{post.title}</strong>
          <p>{post.description}</p>
        </div>

        <div className="product-actions">
          <div className="price">
            R{post.price ? post.price.toLocaleString() : "0.00"}
          </div>
          
          <Link to={`/BuyNow/${post.id}`} className="buynow">
            Buy Now <BaggageClaim size={18}/>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;