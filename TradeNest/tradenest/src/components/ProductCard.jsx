import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BaggageClaim, MessageCircle, Play } from 'lucide-react';

const ProductCard = ({ post }) => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!post) return null;

  const backendBaseUrl = "https://localhost:7124/uploads/";

  const handleNegotiate = () => {
    navigate(`/inbox?userId=${post.userId}&orderId=${post.id}`);
  };

  const formatUrl = (url, fallback) => {
    if (!url) return fallback;
    if (url.startsWith("blob:") || url.startsWith("http")) return url;
    return `${backendBaseUrl}${url}`;
  };

  const isVideo = post.mediaUrl?.match(/\.(mp4|webm|mov|ogg)$/i);
  const mediaUrl = formatUrl(post.mediaUrl, "/placeholder-product.jpg");
  const profileImgName = post.profilePictureUrl || post.profile?.imageUrl;
  const profileUrl = formatUrl(profileImgName, "/profile.jpg");
  const displayName = post.handleName || post.name || "User";

  // 1. TikTok Auto-Play/Pause Logic with Safety Guards
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!isVideo || !videoElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Double check the ref still exists when the intersection fires
        if (!videoRef.current) return;

        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {
            // Silently handle autoplay blocks
          });
          setIsPaused(false);
        } else {
          // Use optional chaining to prevent "reading properties of null"
          videoRef.current?.pause();
          setIsPaused(true);
        }
      },
      { threshold: 0.8 } 
    );

    observer.observe(videoElement);

    return () => {
      // Clean up the specific element we were observing
      if (videoElement) {
        observer.unobserve(videoElement);
      }
      observer.disconnect();
    };
  }, [isVideo]);

  // 2. Video Progress Tracking (Safe from null/zero duration)
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  // 3. Manual Play/Pause Toggle
  const togglePlay = (e) => {
    if (!isVideo || !videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().catch(err => {
        console.warn("Video playback failed:", err);
      });
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  return (
    <div className="post-container"> 
      {/* --- MEDIA SECTION --- */}
      {isVideo ? (
        <div className="video-wrapper" onClick={togglePlay}>
          <video 
            ref={videoRef}
            src={mediaUrl} 
            className="feed-media"
            loop 
            muted 
            playsInline
            onTimeUpdate={handleTimeUpdate}
          />
          
          <div className="video-progress-container">
            <div className="video-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          {isPaused && (
            <div className="play-overlay">
              <Play size={64} fill="white" color="white" style={{ opacity: 0.7 }} />
            </div>
          )}
        </div>
      ) : (
        <img 
          src={mediaUrl} 
          alt={post.title} 
          className="feed-media"
          onError={(e) => { e.target.src = "/placeholder-product.jpg"; }}
        />
      )}

      {/* --- UI OVERLAY SECTION --- */}
      <div className="productInfo">
        <div className="profileInfo">
          <img 
            src={profileUrl} 
            className="profile-pic" 
            alt="User" 
            onError={(e) => { e.target.src = "/profile.jpg"; }}
          />
          <span>@{displayName}</span>
        </div>

        <div className="description">
          <strong>{post.title}</strong>
          <p>{post.description}</p>
        </div>

        <div className="product-actions">
          <div className="price">
            R{post.price ? post.price.toLocaleString() : "0.00"}
          </div>

          <div className="action-buttons-row" style={{ display: 'flex', gap: '8px' }}>
             <button onClick={handleNegotiate} className="negotiate-btn">
               Chat <MessageCircle size={18}/>
             </button>
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