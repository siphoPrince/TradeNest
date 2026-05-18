import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    Settings, 
    UserRoundPen, 
    X, 
    Heart, 
    MessageCircle, 
    ShoppingBag, 
    ChevronUp, 
    ChevronDown, 
    Share2,
    Bookmark,
    Grid,
    User,
    Bell,
    MapPin 
} from 'lucide-react';
import Navigation from "../components/Navigation";
import "../styles/Profile.css";
import "../styles/Follow.css";
import ProductCard from "../components/ProductCard";

const Profile = () => {
    const [userPosts, setUserPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [profile, setProfile] = useState(null); 
    const [selectedPostIndex, setSelectedPostIndex] = useState(null);
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
    const backendUrl = "https://localhost:7124/uploads/";
    const loggedInUserId = localStorage.getItem("userId");
    const isOwnProfile = !id || id === loggedInUserId;

    const currentViewPosts = activeTab === "saved" ? savedPosts : userPosts;

    const fetchFollowData = async (type) => {
        const token = localStorage.getItem("token");
        const targetUserId = id || loggedInUserId;
        
        setFollowModalTitle(type === "followers" ? "Followers" : "Following");
        setShowFollowModal(true);
        setLoadingFollow(true);
        setFollowList([]);

        try {
            const endpoint = type === "followers" ? "followers" : "following";
            const response = await fetch(`https://localhost:7124/api/follow/${endpoint}/${targetUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setFollowList(data);
            }
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
        } finally {
            setLoadingFollow(false);
        }
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

    useEffect(() => {
        document.body.style.overflow = (selectedPostIndex !== null || showFollowModal) ? 'hidden' : 'unset';
    }, [selectedPostIndex, showFollowModal]);

    useEffect(() => {
        if (activeTab === "saved" && isOwnProfile) {
            fetchSavedPosts();
        }
    }, [activeTab]);

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem("token");
            const targetUserId = id || loggedInUserId;

            if (!targetUserId || targetUserId === "undefined") return;

            try {
                if (isOwnProfile) {
                    fetch(`https://localhost:7124/api/notifications/unread-counts/${targetUserId}`)
                        .then(res => res.ok ? res.json() : null)
                        .then(data => {
                            if (data) setNotificationsCount(data.notificationsCount || 0);
                        })
                        .catch(err => console.error("Error fetching initial badge counts:", err));
                }

                const profileResponse = await fetch(`https://localhost:7124/api/profile/${targetUserId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (profileResponse.status === 404 && isOwnProfile) {
                    navigate("/editProfile");
                    return;
                }

                if (profileResponse.ok) {
                    const data = await profileResponse.json();
                    
                    setProfile({
                        ...data.profile,
                        email: data.profile.user?.email,
                        tradeSafeId: data.profile.user?.tradeSafeRecipientId,
                        followersCount: data.followersCount || 0,
                        followingCount: data.followingCount || 0,
                        soldCount: data.profile.soldCount || 0, // Maps counter safely from database schema
                        suburb: data.profile.suburb || "",
                        city: data.profile.city || "",
                        province: data.profile.province || ""
                    });
                    if (data.isFollowing !== undefined) setIsFollowing(data.isFollowing);
                }

                setLoadingPosts(true);
                const postsResponse = await fetch(`https://localhost:7124/api/posts/user/${targetUserId}?pageNumber=1&pageSize=10`);

                if (postsResponse.ok) {
                    const postsData = await postsResponse.json();
                    setUserPosts(postsData.data || []);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchProfileData();
    }, [id, loggedInUserId, navigate, isOwnProfile]);

    const fetchSavedPosts = async () => {
        const token = localStorage.getItem("token");
        setLoadingPosts(true);
        try {
            const response = await fetch(`https://localhost:7124/api/bookmarks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSavedPosts(data || []);
            }
        } catch (error) {
            console.error("Error fetching saved posts:", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const toggleSave = async (postId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`https://localhost:7124/api/bookmarks/${postId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                if (activeTab === "saved") fetchSavedPosts();
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

    const handleFollow = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`https://localhost:7124/api/follow/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'UserId': loggedInUserId
                }
            });

            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing);
                setProfile(prev => ({
                    ...prev,
                    followersCount: data.isFollowing ? (prev.followersCount || 0) + 1 : (prev.followersCount || 0) - 1
                }));
            }
        } catch (error) {
            console.error("Follow failed:", error);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`https://localhost:7124/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setUserPosts(userPosts.filter(post => post.id !== postId));
                setSelectedPostIndex(null);
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const isVideo = (url) => url?.match(/\.(mp4|webm|ogg|mov)$/i);
    const getMediaUrl = (url) => url?.startsWith("http") ? url : `${backendUrl}${url}`;

    if (!profile && !loadingPosts) return <div className="loading">Profile not found. 😕</div>;
    if (!profile) return <div className="loading">Loading Profile... ⏳</div>;

    return (
        <div className="profile-layout">
            <Navigation />
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-header">
                        {isOwnProfile && (
                            <div className="mobile-bell-anchor" onClick={() => navigate("/activity")} style={{ position: 'relative' }}>
                                <Bell size={24} />
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
                            <span className="userName">{profile?.name} {profile?.surName}</span>
                            <small className="userHandle">@{profile?.handleName || "user"}</small>
                            <small className="bio">{profile?.bio || "No bio yet."}</small>

                            <div className="profile-meta-info">
                                {(profile?.suburb || profile?.city) && (
                                    <div className="profile-location-tag" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '13px', marginTop: '6px' }}>
                                        <MapPin size={15} style={{ color: '#ff3b30' }} />
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
                                        Edit Profile <UserRoundPen size={16} />
                                    </button>
                                ) : (
                                    <button className={isFollowing ? "followingBut" : "followBut"} onClick={handleFollow}>
                                        {isFollowing ? "Following" : "Follow"}
                                    </button>
                                )}
                                {isOwnProfile && (
                                    <>
                                        <button 
                                            className="shareBut"
                                            onClick={() => handleShare(
                                                `Check out ${profile?.name} on Cylo`, 
                                                `View ${profile?.name}'s listings and shop securely.`, 
                                                window.location.href
                                            )}>Share Profile</button>

                                        <button className="accountBtn" onClick={() => navigate("/settings")}>
                                            Settings <Settings size={16} />
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
                                <Grid size={16} /> Listings
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === "saved" ? "active" : ""}`}
                                onClick={() => setActiveTab("saved")}
                            >
                                <Bookmark size={16} /> Saved
                            </button>
                        </div>
                    )}
                </div>

                <div className="user-listings">
                    <div className="listingContainer">
                        {loadingPosts ? (
                            <p className="empty-msg">Loading content...</p>
                        ) : currentViewPosts.length > 0 ? (
                            currentViewPosts.map((post, index) => {
                                const postData = activeTab === "saved" ? post.post : post;
                                return (
                                    <div key={postData.id} className="card" onClick={() => setSelectedPostIndex(index)}>
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

            {/* --- FOLLOW MODAL --- */}
            {showFollowModal && (
                <div className="follow-modal-overlay" onClick={() => setShowFollowModal(false)}>
                    <div className="follow-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="follow-modal-header">
                            <h3>{followModalTitle}</h3>
                            <button className="close-modal" onClick={() => setShowFollowModal(false)}><X size={20}/></button>
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

            {/* --- TIKTOK STYLE VIEWER --- */}
            {selectedPostIndex !== null && currentViewPosts[selectedPostIndex] && (
                <div className="profile-modal-overlay" onClick={() => setSelectedPostIndex(null)}>
                    <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setSelectedPostIndex(null)}>✕</button>
                        {(() => {
                            const post = currentViewPosts[selectedPostIndex];
                            return (
                                <div className="modal-inner-layout">
                                    <ProductCard post={post} />
                                    <div className="tt-nav">
                                        {selectedPostIndex > 0 && (
                                            <button 
                                                className="nav-arrow up"
                                                onClick={() => setSelectedPostIndex(selectedPostIndex - 1)}
                                            >
                                                <ChevronUp size={40}/>
                                            </button>
                                        )}
                                        {selectedPostIndex < currentViewPosts.length - 1 && (
                                            <button 
                                                className="nav-arrow down"
                                                onClick={() => setSelectedPostIndex(selectedPostIndex + 1)}
                                            >
                                                <ChevronDown size={40}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;