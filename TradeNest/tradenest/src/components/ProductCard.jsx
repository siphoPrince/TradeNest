import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BaggageClaim, Play } from 'lucide-react';

const ProductCard = ({ post }) => {
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!post) return null;

  const isVideo = post.mediaUrl?.match(/\.(mp4|webm|mov|ogg)$/i);
  const backendBaseUrl = "https://localhost:7124/uploads/";
  const mediaUrl = post.mediaUrl ? `${backendBaseUrl}${post.mediaUrl}` : "/placeholder-product.jpg";
  const profileUrl = post.profilePictureUrl ? `${backendBaseUrl}${post.profilePictureUrl}` : "/profile.jpg";

  // 1. TikTok Auto-Play/Pause Logic
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
          setIsPaused(false);
        } else {
          videoRef.current.pause();
          setIsPaused(true);
        }
      },
      { threshold: 0.8 } 
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [isVideo]);

  // 2. Video Progress Tracking
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  // 3. Manual Play/Pause Toggle
  const togglePlay = (e) => {
    if (!isVideo) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
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
          
          {/* Progress Bar Line */}
          <div className="video-progress-container">
            <div className="video-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          {/* Centered Play Icon if paused */}
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

      {/* --- UI OVERLAY SECTION (The stuff that went missing!) --- */}
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