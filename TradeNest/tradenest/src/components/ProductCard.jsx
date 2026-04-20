import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BaggageClaim, MessageCircle, Play, Pause, Volume2, VolumeX, Package } from 'lucide-react';

const ProductCard = ({ post }) => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const wasManuallyPaused = useRef(false);
  const controlsTimeoutRef = useRef(null);

  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);

  if (!post) return null;

  // Handle case-sensitivity from Backend (Quantity vs quantity)
  const stockCount = post.quantity !== undefined ? post.quantity : (post.Quantity || 0);

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

  const triggerControls = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!isVideo || !videoElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          if (!wasManuallyPaused.current) {
            videoRef.current.play().catch(() => {});
            setIsPaused(false);
          }
        } else {
          videoRef.current.pause();
          setIsPaused(true);
        }
      },
      { threshold: 0.6 } 
    );

    observer.observe(videoElement);
    return () => {
      if (videoElement) observer.unobserve(videoElement);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
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
    triggerControls(); 
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
      wasManuallyPaused.current = false;
    } else {
      videoRef.current.pause();
      setIsPaused(true);
      wasManuallyPaused.current = true;
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    triggerControls();
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (!newMutedState && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    triggerControls();
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
      videoRef.current.muted = newVolume === 0;
    }
  };

  // Reusable Stock Badge Component
  const StockBadge = () => (
    <div className={`stock-counter-ui ${stockCount <= 5 ? 'urgent' : ''}`} style={{ position: 'relative' }}>
      <Package size={20} color="white" />
      <span style={{
        position: 'absolute',
        top: '-5px',
        right: '-8px',
        background: stockCount <= 5 ? '#ef4444' : '#3b82f6',
        color: 'white',
        fontSize: '10px',
        fontWeight: 'bold',
        minWidth: '16px',
        height: '16px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid #000',
        padding: '2px'
      }}>
        {stockCount}
      </span>
    </div>
  );

  return (
    <div className="post-container" onMouseMove={triggerControls}> 
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
          
          {/* TOP CONTROLS BAR */}
          <div className={`video-top-controls ${showControls || isPaused ? 'visible' : 'hidden'}`}>
            
            {/* LEFT EDGE: Stock Badge */}
            <StockBadge />

            {/* RIGHT GROUP: Play/Pause and Volume */}
            <div className="controls-right-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="video-control-btn" onClick={togglePlay}>
                {isPaused ? <Play size={18} fill="white" /> : <Pause size={18} fill="white" />}
              </button>

              <div className="volume-control-wrapper">
                <button className="video-control-btn" onClick={toggleMute}>
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="volume-slider-container">
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={isMuted ? 0 : volume} 
                    onChange={handleVolumeChange}
                    onClick={(e) => e.stopPropagation()} 
                    className="volume-slider"
                  />
                </div>
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
        <div className="image-wrapper" style={{ position: 'relative' }}>
          <img src={mediaUrl} alt={post.title} className="feed-media" />
          <div className="stock-counter-ui-image" style={{ position: 'absolute', top: '15px', left: '15px' }}>
              <StockBadge />
          </div>
        </div>
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