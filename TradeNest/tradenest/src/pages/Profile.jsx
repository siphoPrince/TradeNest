import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    Settings, 
    UserRoundPen, 
    X, 
    ChevronUp, 
    ChevronDown, 
    Bookmark,
    Grid,
    Bell,
    MapPin,
    BadgeCheck,
    ExternalLink
} from 'lucide-react';
import Navigation from "../components/Navigation";
import "../styles/Profile.css";
import "../styles/Follow.css";
import ProductCard from "../components/ProductCard";
import api from "../services/api";

const Profile = () => {
    const [userPosts, setUserPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [profile, setProfile] = useState(null); 
    const [selectedPostId, setSelectedPostId] = useState(null); 
    const [activeTab, setActiveTab] = useState("listings");
    const [savedPosts, setSavedPosts] = useState([]);
    const [notificationsCount, setNotificationsCount] = useState(0);

    // Follow Modal States
    const [showFollowModal, setShowFollowModal] = useState(false);
    const [followModalTitle, setFollowModalTitle] = useState("");
    const [followList, setFollowList] = useState([]);
    const [loadingFollow, setLoadingFollow] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();
    const loggedInUserId = localStorage.getItem("userId");
    const isOwnProfile = !id || id === loggedInUserId;

    const currentViewPosts = activeTab === "saved" ? savedPosts : userPosts;

    // Extract the normalized inner post object safely
    const getCleanPostData = useCallback((item) => {
        if (!item) return null;
        return activeTab === "saved" ? item.post : item;
    }, [activeTab]);

    // Find current active index and post objects dynamically
    const currentPostIndex = currentViewPosts.findIndex(
        item => getCleanPostData(item)?.id === selectedPostId
    );
    const cleanActivePost = getCleanPostData(currentViewPosts[currentPostIndex]);

    // Migrated from fetch to Axios custom instance
    const fetchFollowData = async (type) => {
        const targetUserId = id || loggedInUserId;
        
        setFollowModalTitle(type === "followers" ? "Followers" : "Following");
        setShowFollowModal(true);
        setLoadingFollow(true);
        setFollowList([]);

        try {
            const endpoint = type === "followers" ? "followers" : "following";
            const response = await api.get(`/api/follow/${endpoint}/${targetUserId}`);
            setFollowList(response.data || []);
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
        } finally {
            setLoadingFollow(false);
        }
    };

    // Helper to deeply map and update fields inside arrays containing raw posts or bookmarked item objects
    const updatePostInStateArrays = useCallback((postId, updatedFields) => {
        const updater = (prevItems, isSavedTab) => 
            prevItems.map(item => {
                if (isSavedTab) {
                    if (item.post?.id === postId) {
                        return { ...item, post: { ...item.post, ...updatedFields } };
                    }
                } else {
                    if (item.id === postId) {
                        return { ...item, ...updatedFields };
                    }
                }
                return item;
            });

        setUserPosts(prev => updater(prev, false));
        setSavedPosts(prev => updater(prev, true));
    }, []);

    // Migrated from fetch to Axios custom instance
    const handleItemSold = async (postId) => {
        try {
            const response = await api.post(`/api/posts/${postId}/sold`);
            
            if (response.status === 200 || response.status === 201) {
                const data = response.data;
                
                setProfile(prev => {
                    if (!prev) return null;
                    return { 
                        ...prev, 
                        soldCount: data.newSoldCount !== undefined ? data.newSoldCount : (prev.soldCount || 0) + 1
                    };
                });

                updatePostInStateArrays(postId, { isSold: true });
            }
        } catch (error) {
            console.error("Error processing sales trigger:", error);
        }
    };

    // Dynamic dynamic comment count updates from modal interactions
    const handleUpdateCommentCount = (postId, newCount) => {
        updatePostInStateArrays(postId, { commentCount: newCount });
    };

    const handleShare = async (title, text, url) => {
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    // Migrated from fetch to Axios custom instance
    const fetchSavedPosts = useCallback(async () => {
        setLoadingPosts(true);
        try {
            const response = await api.get("/api/bookmarks");
            setSavedPosts(response.data || []);
        } catch (error) {
            console.error("Error fetching saved posts:", error);
        } finally {
            setLoadingPosts(false);
        }
    }, []);

    // Tab Data Fetcher Sync
    useEffect(() => {
        if (activeTab === "saved" && isOwnProfile) {
            fetchSavedPosts();
        }
    }, [activeTab, isOwnProfile, fetchSavedPosts]);

    // Body Scroll-Lock Management
    useEffect(() => {
        const shouldLock = selectedPostId !== null || showFollowModal;
        document.body.style.overflow = shouldLock ? 'hidden' : 'unset';
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedPostId, showFollowModal]);

    // Primary Core Profile Data Loader Sync
    useEffect(() => {
        const fetchProfileData = async () => {
            const targetUserId = id || loggedInUserId;

            if (!targetUserId || targetUserId === "undefined" || targetUserId === "null") return;

            setUserPosts([]);
            setSavedPosts([]);
            setLoadingPosts(true);

            try {
                // 1. Fetch Notification Badges if it's the user's own profile
                if (isOwnProfile) {
                    api.get(`/api/notifications/unread-counts/${targetUserId}`)
                        .then(response => {
                            const data = response.data;
                            setNotificationsCount(data.notificationsCount || 0);
                        })
                        .catch(err => console.error("Error fetching badge counts:", err));
                }

                // 2. Fetch Profile Details securely using your global Axios api client
                const profileResponse = await api.get(`/api/profile/${targetUserId}`);
                const profileData = profileResponse.data;

                if (profileData) {
                    setProfile({
                        ...profileData.profile,
                        isVerified: profileData.profile?.user?.isVerified,
                        email: profileData.profile?.user?.email,
                        tradeSafeId: profileData.profile?.user?.tradeSafeRecipientId,
                        followersCount: profileData.followersCount || 0,
                        followingCount: profileData.followingCount || 0,
                        soldCount: profileData.profile?.soldCount || 0,
                        suburb: profileData.profile?.suburb || "",
                        city: profileData.profile?.city || "",
                        province: profileData.profile?.province || ""
                    });
                    
                    if (profileData.isFollowing !== undefined) {
                        setIsFollowing(profileData.isFollowing);
                    }
                }

            } catch (error) {
                if (error.response && error.response.status === 404 && isOwnProfile) {
                    navigate("/editProfile");
                    return;
                }
                console.error("Error fetching profile details:", error);
            }

            // 3. Separate Try/Catch for user posts
            try {
                const postsResponse = await api.get(`/api/posts/user/${targetUserId}?pageNumber=1&pageSize=10`);
                const postsData = postsResponse.data;
                setUserPosts(postsData.data || postsData.Data || []);
            } catch (error) {
                console.error("Error fetching user posts:", error);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchProfileData();
    }, [id, loggedInUserId, navigate, isOwnProfile]);

    // Migrated from fetch to Axios custom instance
    const toggleSave = async (postId) => {
        try {
            const response = await api.post(`/api/bookmarks/${postId}`);
            if (response.status === 200 || response.status === 201) {
                if (activeTab === "saved") {
                    if (selectedPostId === postId) {
                        if (currentViewPosts.length > 1) {
                            const nextIndex = currentPostIndex === currentViewPosts.length - 1 ? currentPostIndex - 1 : currentPostIndex + 1;
                            setSelectedPostId(getCleanPostData(currentViewPosts[nextIndex])?.id);
                        } else {
                            setSelectedPostId(null);
                        }
                    }
                    fetchSavedPosts();
                }
            }
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    useEffect(() => {
        const handleCountsUpdate = (e) => {
            if (e.detail) {
                setNotificationsCount(e.detail.notificationsCount || 0);
            }
        };

        window.addEventListener("badgeCountsUpdated", handleCountsUpdate);
        return () => window.removeEventListener("badgeCountsUpdated", handleCountsUpdate);
    }, []);

    // Migrated from fetch to Axios custom instance
    const handleFollow = async () => {
        try {
            const response = await api.post(`/api/follow/${id}`);
            const data = response.data;
            setIsFollowing(data.isFollowing);
            setProfile(prev => ({
                ...prev,
                followersCount: data.isFollowing ? (prev.followersCount || 0) + 1 : (prev.followersCount || 0) - 1
            }));
        } catch (error) {
            console.error("Follow failed:", error);
        }
    };

    // Migrated from fetch to Axios custom instance
    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            const response = await api.delete(`/api/posts/${postId}`);
            if (response.status === 200 || response.status === 204) {
                if (selectedPostId === postId) {
                    if (currentViewPosts.length > 1) {
                        const nextIndex = currentPostIndex === currentViewPosts.length - 1 ? currentPostIndex - 1 : currentPostIndex + 1;
                        setSelectedPostId(getCleanPostData(currentViewPosts[nextIndex])?.id);
                    } else {
                        setSelectedPostId(null);
                    }
                }
                setUserPosts(prev => prev.filter(post => post.id !== postId));
                setSavedPosts(prev => prev.filter(post => post.post?.id !== postId));
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const isVideo = (url) => url?.match(/\.(mp4|webm|ogg|mov)$/i);
    const getMediaUrl = (url) => url?.startsWith("http") ? url : `${api.defaults.baseURL}/uploads/${url}`;

    if (!profile && !loadingPosts) return <div className="loading">Profile not found. 😕</div>;
    if (!profile) return <div className="loading">Loading Profile... ⏳</div>;

    return (
        <div className="profile-layout">
            <Navigation/>
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-header">
                        {isOwnProfile && (
                            <div className="mobile-bell-anchor" onClick={() => navigate("/activity")} style={{ position: 'relative', cursor: 'pointer' }}>
                                <Bell size={24}/>
                                {notificationsCount > 0 && (
                                    <span className="sidebar-badge mobile-badge">{notificationsCount}</span>
                                )}
                            </div>
                        )}
                        <img
                            src={profile?.imageUrl ? getMediaUrl(profile.imageUrl) : "https://picsum.photos/120"}
                            className="profileImg"
                            alt="Profile"
                            onError={(e) => { e.target.src = "https://picsum.photos/120"; }}
                        />
                        <div className="profile-info">
                            <div className="profile-author-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="userName">{profile?.name} {profile?.surName}</span>
                                {profile?.isVerified && (
                                    <BadgeCheck className="verified-badge-icon" size={18} title="Verified Seller (12+ Sales)" style={{ color: '#007fff' }}/>
                                )}
                            </div>

                            <small className="userHandle">@{profile?.handleName || "user"}</small>
                            <small className="bio">{profile?.bio || "No bio yet."}</small>

                            <div className="profile-meta-info">
                                {(profile?.suburb || profile?.city) && (
                                    <div className="profile-location-tag" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '13px', marginTop: '6px' }}>
                                        <MapPin size={15} style={{ color: '#ff3b30' }}/>
                                        <span>
                                            Based in <strong>
                                                {profile.suburb ? `${profile.suburb}, ` : ""}{profile.city}
                                            </strong>
                                            {profile.province && <span style={{ color: '#999' }}> ({profile.province})</span>}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="profile-actions">
                                {isOwnProfile ? (
                                    <button className="editBut" onClick={() => navigate("/editProfile")}>
                                        Edit Profile <UserRoundPen size={16}/>
                                    </button>
                                ) : (
                                    <button className={isFollowing ? "followingBut" : "followBut"} onClick={handleFollow}>
                                        {isFollowing ? "Following" : "Follow"}
                                    </button>
                                )}
                                {isOwnProfile && (
                                    <>
                                        <button 
                                            className="profile-action-btn"
                                            onClick={() => handleShare(
                                                `Check out ${profile?.name} on Cylo`, 
                                                `View ${profile?.name}'s listings and shop securely.`, 
                                                window.location.href
                                            )}>Share <ExternalLink size={16} style={{ marginLeft: '6px' }}/>
                                        </button>

                                        <button className="profile-action-btn" onClick={() => navigate("/settings")}>
                                            Settings <Settings size={16} style={{ marginLeft: '6px' }}/>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="profile-stats">
                        <div className="stat">
                            <span className="stat-number">{userPosts.length}</span>
                            <span className="stat-label">Listings</span>
                        </div>
                        
                        <div className="stat" onClick={() => fetchFollowData("followers")} style={{cursor: 'pointer'}}>
                            <span className="stat-number">{profile?.followersCount || 0}</span>
                            <span className="stat-label">Followers</span>
                        </div>
                        <div className="stat" onClick={() => fetchFollowData("following")} style={{cursor: 'pointer'}}>
                            <span className="stat-number">{profile?.followingCount || 0}</span>
                            <span className="stat-label">Following</span>
                        </div>
                        
                        <div className="stat">
                            <span className="stat-number">{profile?.soldCount || 0}</span>
                            <span className="stat-label">Sold</span>
                        </div>
                    </div>

                    {isOwnProfile && (
                        <div className="profile-tabs-nav">
                            <button 
                                className={`tab-btn ${activeTab === "listings" ? "active" : ""}`}
                                onClick={() => setActiveTab("listings")}
                            >
                                <Grid size={16}/> Listings
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === "saved" ? "active" : ""}`}
                                onClick={() => setActiveTab("saved")}
                            >
                                <Bookmark size={16}/> Saved
                            </button>
                        </div>
                    )}
                </div>

                <div className="user-listings">
                    <div className="listingContainer">
                        {loadingPosts ? (
                            <p className="empty-msg">Loading content...</p>
                        ) : currentViewPosts.length > 0 ? (
                            currentViewPosts.map((item) => {
                                const postData = getCleanPostData(item);
                                if (!postData) return null;
                                return (
                                    <div key={postData.id} className={`card ${postData.isSold ? "sold-out-card" : ""}`} onClick={() => setSelectedPostId(postData.id)}>
                                        {postData.isSold && (
                                            <div className="sold-out-badge">SOLD</div>
                                        )}
                                        {isVideo(postData.mediaUrl) ? (
                                            <video src={getMediaUrl(postData.mediaUrl)} className="listing-thumb" muted playsInline />
                                        ) : (
                                            <img src={getMediaUrl(postData.mediaUrl)} alt={postData.title} className="listing-thumb" onError={(e) => { e.target.src = "https://picsum.photos/300/400"; }} />
                                        )}
                                        <div className="card-info">
                                            <small className="price">R{postData.price}</small>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="empty-msg">
                                {activeTab === "saved" ? "No saved listings yet." : "No listings to show."}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {showFollowModal && (
                <div className="follow-modal-overlay" onClick={() => setShowFollowModal(false)}>
                    <div className="follow-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="follow-modal-header">
                            <h3>{followModalTitle}</h3>
                            <button className="close-modal" onClick={() => setShowFollowModal(false)}>
                                <X size={20}/>
                            </button>
                        </div>
                        <div className="follow-modal-body">
                            {loadingFollow ? (
                                <p>Loading...</p>
                            ) : followList.length > 0 ? (
                                followList.map(user => (
                                    <div key={user.id} className="follow-item" onClick={() => {
                                        setShowFollowModal(false);
                                        navigate(`/profile/${user.id}`);
                                    }}>
                                        <img 
                                            src={user.profileImageUrl ? getMediaUrl(user.profileImageUrl) : "https://picsum.photos/50"} 
                                            alt={user.userName} 
                                        />
                                        <div className="follow-user-info">
                                            <span>{user.userName}</span>
                                            <small>{user.handleName || `@${user.userName}`}</small>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-follow">No {followModalTitle.toLowerCase()} yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedPostId !== null && cleanActivePost && (
                <div className="profile-modal-overlay" onClick={() => setSelectedPostId(null)}>
                    <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setSelectedPostId(null)}>✕</button>
                        <div className="modal-inner-layout">
                            <ProductCard 
                                post={cleanActivePost} 
                                isProfileView={true} 
                                onItemSold={handleItemSold} 
                                onToggleSave={toggleSave} 
                                onDelete={handleDelete}
                                onCommentCountChange={handleUpdateCommentCount}
                            />
                            <div className="tt-nav">
                                {currentPostIndex > 0 && (
                                    <button 
                                        className="nav-arrow up"
                                        onClick={() => setSelectedPostId(getCleanPostData(currentViewPosts[currentPostIndex - 1])?.id)}
                                    >
                                        <ChevronUp size={40}/>
                                    </button>
                                )}
                                {currentPostIndex < currentViewPosts.length - 1 && (
                                    <button 
                                        className="nav-arrow down"
                                        onClick={() => setSelectedPostId(getCleanPostData(currentViewPosts[currentPostIndex + 1])?.id)}
                                    >
                                        <ChevronDown size={40}/>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;