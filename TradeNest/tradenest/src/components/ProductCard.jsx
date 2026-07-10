import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BaggageClaim, MessageCircle, Play, Pause, Volume2, VolumeX, Package, AlertTriangle, Search } from 'lucide-react';

const ProductCard = ({ post, searchQuery = "", setSearchQuery, isProfileView = false, onItemSold }) => {
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
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. STATE INITIALIZATION FOR DYNAMIC REDUCTIONS
  const initialStock = post?.quantity !== undefined ? post.quantity : (post?.Quantity || 0);
  const [localStockCount, setLocalStockCount] = useState(initialStock);
  const [localIsSold, setLocalIsSold] = useState(post?.isSold || false);

  // FIXED: Synchronize using exact primitive values to avoid reference-looping on the entire 'post' object
  const postQtyPrimitive = post?.quantity !== undefined ? post.quantity : (post?.Quantity || 0);
  const postIsSoldPrimitive = post?.isSold || false;

  useEffect(() => {
    setLocalStockCount(postQtyPrimitive);
    setLocalIsSold(postIsSoldPrimitive);
  }, [postQtyPrimitive, postIsSoldPrimitive]);

  // Guard Clause for entirely missing post objects
  if (!post) return null;

  const isSoldOut = localIsSold || localStockCount <= 0;
  const loggedInUserId = localStorage.getItem("userId");
  const isOwnPost = String(post.userId || post.user?.id) === String(loggedInUserId);
  
  // Only hide the card on the main feed if it's out of stock. 
  if (isSoldOut && !isProfileView) {
    return null; 
  }

  const backendBaseUrl = "https://cylosocials.co.za/uploads/";

  const formatUrl = (url, fallback) => {
    if (!url) return fallback;
    if (url.startsWith("blob:") || url.startsWith("http")) return url;
    return `${backendBaseUrl}${url}`;
  };

  const isVideo = post.mediaUrl?.match(/\.(mp4|webm|mov|ogg)$/i);
  const mediaUrl = formatUrl(post.mediaUrl, "/placeholder-product.jpg");
  const profileUrl = formatUrl(post.profilePictureUrl || post.profile?.imageUrl, "/profile.jpg");
  const displayName = post.handleName || post.name || "User";

  // 2. DYNAMIC QUANTITY DECREMENT HANDLER
  const handleDecrementQuantity = async (e) => {
    e.stopPropagation();
    if (isSoldOut || isProcessing) return;

    setIsProcessing(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`https://cylosocials.co.za/api/posts/${post.id}/decrement`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const newQty = data.newQuantity !== undefined ? data.newQuantity : localStockCount - 1;
        
        setLocalStockCount(newQty);
        
        if (newQty <= 0) {
          setLocalIsSold(true);
          if (onItemSold) {
            onItemSold(post.id);
          }
        }
      }
    } catch (error) {
      console.error("Error updating stock quantity metrics:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerControls = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
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

  // OPTIMIZED: Keep progression clean without triggering nested child dependencies
  const handleTimeUpdate = () => {
    if (videoRef.current?.duration) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
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

  const handleSearchToggle = (e) => {
    e.stopPropagation();
    triggerControls();
    const newSearchingState = !isSearching;
    setIsSearching(newSearchingState);
    if (!newSearchingState && setSearchQuery) {
        setSearchQuery("");
    }
  };

  const StockBadge = () => {
    if (isSoldOut) {
      return <div className="stock-counter-ui sold-badge-flag">SOLD OUT</div>;
    }
    return (
      <div className={`stock-counter-ui ${localStockCount <= 3 ? 'urgent-pulse' : ''}`} style={{ position: 'relative' }}>
        {localStockCount <= 3 ? (
          <AlertTriangle size={22} color="#ff4d4d" strokeWidth={3} />
        ) : (
          <Package size={20} color="white" />
        )}
        <span style={{
          position: 'absolute',
          top: '-5px',
          right: '-8px',
          background: localStockCount <= 3 ? '#ff4d4d' : '#22c55e',
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
          {localStockCount}
        </span>
      </div>
    );
  };

  return (
    <div className={`post-container ${isSoldOut ? 'product-sold-out-blur' : ''}`} onMouseMove={triggerControls}> 
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
          
          <div className={`video-top-controls ${showControls || isPaused || isSearching ? 'visible' : 'hidden'}`}>
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
                  
                  <button className="video-control-btn mobile-search-toggle" onClick={handleSearchToggle}>
                      {isSearching ? <span style={{fontSize: '12px', fontWeight: 'bold'}}>X</span> : <Search size={18} />}
                  </button>
              </div>
            </div>
          </div>

          <div className="video-progress-container">
            <div className="video-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          {isPaused && !isSoldOut && (
            <div className="play-overlay">
              <Play size={64} fill="white" color="white" style={{ opacity: 0.5 }} />
            </div>
          )}
        </div>
      ) : (
        <div className="image-wrapper" style={{ position: 'relative' }}>
          <img src={mediaUrl} alt={post.title} className="feed-media" />
          
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

      {isSoldOut && (
        <div className="sold-out-center-banner">
          <span>SOLD OUT</span>
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
          {localStockCount <= 3 && localStockCount > 0 && (
            <span style={{ color: '#ff4d4d', fontSize: '11px', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>
              Only {localStockCount} left in stock!
            </span>
          )}
        </div>
        <div className="product-actions">
          <div className="price">R{post.price?.toLocaleString() || "0.00"}</div>
          
          {isSoldOut ? (
            <button className="buynow sold-out-disabled-btn" disabled>
              Out of Stock 📦
            </button>
          ) : isOwnPost && isProfileView ? (
            <button 
              className="buynow reduce-stock-btn" 
              onClick={handleDecrementQuantity}
              disabled={isProcessing}
              style={{ background: '#f59e0b' }}
            >
              {isProcessing ? "Updating..." : "Mark Item Sold"}
            </button>
          ) : (
            <Link to={`/BuyNow/${post.id}`} className="buynow" onClick={saveScroll}>
              Buy Now <BaggageClaim size={18}/>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;