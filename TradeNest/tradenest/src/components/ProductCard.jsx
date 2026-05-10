import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BaggageClaim, MessageCircle, Play, Pause, Volume2, VolumeX, Package, AlertTriangle, Search } from 'lucide-react';

const ProductCard = ({ post, searchQuery = "", setSearchQuery }) => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const wasManuallyPaused = useRef(false);
  const controlsTimeoutRef = useRef(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);

  // 1. THE STOCKADE CHECK
  const stockCount = post?.quantity !== undefined ? post.quantity : (post?.Quantity || 0);
  
  if (!post || stockCount <= 0) {
    return null; 
  }

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
    // Don't auto-hide controls if we are actively typing in the search bar
    if (!isSearching) {
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const saveScroll = () => {
  sessionStorage.setItem("feed-scroll", window.scrollY);
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
      const shouldBeMuted = newVolume === 0;
      setIsMuted(newVolume === 0);
      videoRef.current.muted = newVolume === 0;
    }
  };

  // Toggle Search Input and clear query on close
  const handleSearchToggle = (e) => {
    e.stopPropagation();
    triggerControls();
    const newSearchingState = !isSearching;
    setIsSearching(newSearchingState);
    
    // Clear global search query if they close the search bar
    if (!newSearchingState && setSearchQuery) {
        setSearchQuery("");
    }
  };

  const StockBadge = () => (
    <div className={`stock-counter-ui ${stockCount <= 3 ? 'urgent-pulse' : ''}`} style={{ position: 'relative' }}>
      {stockCount <= 3 ? (
        <AlertTriangle size={22} color="#ff4d4d" strokeWidth={3} />
      ) : (
        <Package size={20} color="white" />
      )}
      <span style={{
        position: 'absolute',
        top: '-5px',
        right: '-8px',
        background: stockCount <= 3 ? '#ff4d4d' : '#22c55e',
        color: 'white',
        fontSize: '10px',
        fontWeight: '900',
        minWidth: '18px',
        height: '18px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid #000',
        padding: '2px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
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
          
          {/* Controls Overlay */}
          <div className={`video-top-controls ${showControls || isPaused || isSearching ? 'visible' : 'hidden'}`}>
            <StockBadge />

            <div className="controls-right-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: isSearching ? 1 : 0, marginLeft: '10px' }}>
              
              {/* SLIDE OUT SEARCH INPUT */}
              {isSearching && (
                  <input 
                      type="text"
                      autoFocus
                      placeholder="Search feed..."
                      className="inline-search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()} 
                  />
              )}

              <div className="controls-icons" style={{ display: 'flex', gap: '12px' }}>
                  {/* HIDE PLAY/VOLUME IF SEARCHING */}
                  {!isSearching && (
                      <>
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
                      </>
                  )}
                  
                  {/* SEARCH TOGGLE ICON */}
                  <button className="video-control-btn mobile-search-toggle" onClick={handleSearchToggle}>
                      {isSearching ? <span style={{fontSize: '12px', fontWeight: 'bold'}}>X</span> : <Search size={18} />}
                  </button>
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
          
          {/* Top layout for images to match videos */}
          <div className="video-top-controls visible">
            <StockBadge />
            <div className="controls-right-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: isSearching ? 1 : 0, marginLeft: '10px' }}>
              {isSearching && (
                  <input 
                      type="text"
                      autoFocus
                      placeholder="Search feed..."
                      className="inline-search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()} 
                  />
              )}
              <div className="controls-icons" style={{ display: 'flex', gap: '12px' }}>
                  <button className="video-control-btn mobile-search-toggle" onClick={handleSearchToggle}>
                      {isSearching ? <span style={{fontSize: '12px', fontWeight: 'bold'}}>X</span> : <Search size={18} />}
                  </button>
              </div>
            </div>
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
          {stockCount <= 3 && (
            <span style={{ color: '#ff4d4d', fontSize: '11px', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>
              Only {stockCount} left in stock!
            </span>
          )}
        </div>
        <div className="product-actions">
          <div className="price">R{post.price?.toLocaleString() || "0.00"}</div>
          <Link to={`/BuyNow/${post.id}`} className="buynow" onClick={saveScroll}>
            Buy Now <BaggageClaim size={18}/>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;