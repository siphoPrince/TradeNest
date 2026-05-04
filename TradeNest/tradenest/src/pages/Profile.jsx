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
    Share2 
} from 'lucide-react';
import Navigation from "../components/Navigation";
import "../styles/Profile.css";
import "../styles/Follow.css";

const Profile = () => {
    const [userPosts, setUserPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [profile, setProfile] = useState(null);
    const [selectedPostIndex, setSelectedPostIndex] = useState(null);
    const [activeTab, setActiveTab] = useState("listings");
    const [savedPosts, setSavedPosts] = useState([]);

    const navigate = useNavigate();
    const { id } = useParams();
    const backendUrl = "https://localhost:7124/uploads/";
    const loggedInUserId = localStorage.getItem("userId");
    const isOwnProfile = !id || id === loggedInUserId;

    // --- LOCK BODY SCROLL ---
    useEffect(() => {
        if (selectedPostIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [selectedPostIndex]);

    useEffect(() => {
    if (activeTab === "saved" && isOwnProfile) {
        fetchSavedPosts();
    }
}, [activeTab]);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem("token");
            const targetUserId = id || loggedInUserId;

            if (!targetUserId || targetUserId === "undefined") return;
            if (!token) {
                navigate("/signIn");
                return;
            }

            try {
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
                        followingCount: data.followingCount || 0
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

    // --- HANDLERS ---
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
                setSelectedPostIndex(null); // Close viewer if open
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const isVideo = (url) => url?.match(/\.(mp4|webm|ogg|mov)$/i);

    // --- SAFETY GUARDS ---
    if (!profile && !loadingPosts) return <div className="loading">Profile not found. 😕</div>;
    if (!profile) return <div className="loading">Loading Profile... ⏳</div>;

    return (
        <div className="profile-layout">
            <Navigation />
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-header">
                        <img
                            src={profile?.imageUrl ? `${backendUrl}${profile.imageUrl}` : "https://picsum.photos/120"}
                            className="profileImg"
                            alt="Profile"
                            onError={(e) => { e.target.src = "https://picsum.photos/120"; }}
                        />
                        <div className="profile-info">
                            <span className="userName">{profile?.name} {profile?.surName}</span>
                            <small className="userHandle">@{profile?.handleName || "user"}</small>
                            <small className="bio">{profile?.bio || "No bio yet."}</small>

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
                                        <button className="shareBut">Share Profile</button>
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
                        <div className="stat">
                            <span className="stat-number">{profile?.followersCount || 0}</span>
                            <span className="stat-label">Followers</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{profile?.followingCount || 0}</span>
                            <span className="stat-label">Following</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Sold</span>
                        </div>
                    </div>
                </div>

                <div className="user-listings">
                    <h2 className="listing-title">{isOwnProfile ? "My Listings" : "Listings"}</h2>
                    <div className="listingContainer">
                        {loadingPosts ? <p>Loading listings...</p> :
                            userPosts.map((post, index) => {
                                const fullUrl = post.mediaUrl?.startsWith("http") ? post.mediaUrl : `${backendUrl}${post?.mediaUrl}`;
                                return (
                                    <div key={post.id} className="card" onClick={() => setSelectedPostIndex(index)}>
                                        {isVideo(post.mediaUrl) ? (
                                            <video src={fullUrl} className="listing-thumb" muted playsInline />
                                        ) : (
                                            <img src={fullUrl} alt={post.title} className="listing-thumb" onError={(e) => { e.target.src = "https://picsum.photos/300/400"; }} />
                                        )}
                                        <div className="card-info">
                                            <small className="price">R{post.price}</small>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>

            {/* --- TIKTOK STYLE VIEWER --- */}
            {selectedPostIndex !== null && (
                <div className="tt-overlay" onClick={() => setSelectedPostIndex(null)}>
                    <button className="tt-close" onClick={() => setSelectedPostIndex(null)}>
                        <X size={30} color="white" />
                    </button>

                    <div className="tt-feed-container" onClick={(e) => e.stopPropagation()}>
                        <div className="tt-slide">
                            <div className="tt-media-wrapper">
                                {isVideo(userPosts[selectedPostIndex].mediaUrl) ? (
                                    <video
                                        src={userPosts[selectedPostIndex].mediaUrl?.startsWith("http") ? userPosts[selectedPostIndex].mediaUrl : `${backendUrl}${userPosts[selectedPostIndex].mediaUrl}`}
                                        autoPlay
                                        loop
                                        controls
                                        playsInline
                                    />
                                ) : (
                                    <img src={userPosts[selectedPostIndex].mediaUrl?.startsWith("http") ? userPosts[selectedPostIndex].mediaUrl : `${backendUrl}${userPosts[selectedPostIndex].mediaUrl}`} alt="" />
                                )}
                            </div>

                            {/* Sidebar UI */}
                            <div className="tt-side-actions">
                                <div className="tt-action">
                                    <div className="tt-avatar-circle">
                                        <img src={profile?.imageUrl ? `${backendUrl}${profile.imageUrl}` : "https://picsum.photos/120"} alt="" />
                                        {!isOwnProfile && <div className="tt-plus-icon">+</div>}
                                    </div>
                                </div>
                                <div className="tt-action"><Heart size={28} fill="white" /><small>Like</small></div>
                                <div className="tt-action" onClick={() => navigate(`/messages/${profile.user?.id}`)}><MessageCircle size={28} fill="white" /><small>Chat</small></div>
                                <div className="tt-action"><ShoppingBag size={28} color="#00ff88" /><small>Buy</small></div>
                                <div className="tt-action"><Share2 size={28} fill="white" /><small>Share</small></div>
                                {isOwnProfile && (
                                    <div className="tt-action" onClick={() => handleDelete(userPosts[selectedPostIndex].id)}>
                                        <small style={{color: '#ff4444'}}>Delete</small>
                                    </div>
                                )}
                            </div>

                            {/* Content Info */}
                            <div className="tt-bottom-info">
                                <h3>@{profile?.handleName}</h3>
                                <p>{userPosts[selectedPostIndex].title}</p>
                                <span className="tt-price-tag">R{userPosts[selectedPostIndex].price}</span>
                            </div>

                            {/* Nav Buttons */}
                            <div className="tt-nav">
                                {selectedPostIndex > 0 && 
                                    <button onClick={() => setSelectedPostIndex(selectedPostIndex - 1)}><ChevronUp size={40}/></button>}
                                {selectedPostIndex < userPosts.length - 1 && 
                                    <button onClick={() => setSelectedPostIndex(selectedPostIndex + 1)}><ChevronDown size={40}/></button>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;