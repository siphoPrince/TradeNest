import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BaggageClaim, MessageCircle, Play, Pause, Volume2, VolumeX } from 'lucide-react';

const ProductCard = ({ post }) => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);

  if (!post) return null;

  const backendBaseUrl = "https://localhost:7124/uploads/";

  const formatUrl = (url, fallback) => {
    if (!url) return fallback;
    if (url.startsWith("blob:") || url.startsWith("http")) return url;
    return `${backendBaseUrl}${url}`;
  };

  const isVideo = post.mediaUrl?.match(/\.(mp4|webm|mov|ogg)$/i);
  const mediaUrl = formatUrl(post.mediaUrl, "/placeholder-product.jpg");
  const profileUrl = formatUrl(post.profilePictureUrl || post.profile?.imageUrl, "/profile.jpg");
  const displayName = post.handleName || post.name || "User";

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!isVideo || !videoElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
          setIsPaused(false);
        } else {
          videoRef.current?.pause();
          setIsPaused(true);
        }
      },
      { threshold: 0.8 } 
    );

    observer.observe(videoElement);
    return () => {
      if (videoElement) observer.unobserve(videoElement);
      observer.disconnect();
    };
  }, [isVideo]);

  const handleTimeUpdate = () => {
    if (videoRef.current?.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      // If we unmute and volume was 0, set it to a default 50%
      if (!newMutedState && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  // --- THE MISSING PIECE ---
  const handleVolumeChange = (e) => {
    e.stopPropagation(); 
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  return (
    <div className="post-container"> 
      {isVideo ? (
        <div className="video-wrapper" onClick={togglePlay}>
          <video 
            ref={videoRef}
            src={mediaUrl} 
            className="feed-media"
            loop 
            muted={isMuted} 
            playsInline
            onTimeUpdate={handleTimeUpdate}
          />
          
          <div className="video-top-controls">
            <button className="video-control-btn" onClick={togglePlay}>
              {isPaused ? <Play size={18} fill="white" /> : <Pause size={18} fill="white" />}
            </button>

            <div className="volume-control-wrapper">
              <button className="video-control-btn" onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <div className="volume-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={isMuted ? 0 : volume} 
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>
            </div>
          </div>

          <div className="video-progress-container">
            <div className="video-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          {isPaused && (
            <div className="play-overlay">
              <Play size={64} fill="white" color="white" style={{ opacity: 0.5 }} />
            </div>
          )}
        </div>
      ) : (
        <img src={mediaUrl} alt={post.title} className="feed-media" />
      )}

      <div className="productInfo">
        <div className="profileInfo">
          <img src={profileUrl} className="profile-pic" alt="User" />
          <span>@{displayName}</span>
        </div>
        <div className="description">
          <strong>{post.title}</strong>
          <p>{post.description}</p>
        </div>
        <div className="product-actions">
          <div className="price">R{post.price?.toLocaleString() || "0.00"}</div>
          <button onClick={() => navigate(`/inbox?userId=${post.userId}&orderId=${post.id}`)} className="negotiate-btn">
            Chat <MessageCircle size={18}/>
          </button>
          <Link to={`/BuyNow/${post.id}`} className="buynow">
            Buy Now <BaggageClaim size={18}/>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;