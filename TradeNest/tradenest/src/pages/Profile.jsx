import "../styles/Profile.css";
import "../styles/Follow.css"
import Navigation from "../components/Navigation";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Settings, UserRoundPen } from 'lucide-react';

const Profile = () => {
    const [userPosts, setUserPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [profile, setProfile] = useState(null); 
    const navigate = useNavigate();
    
    // 🔥 Ensure your App.jsx route uses path="/profile/:id"
    const { id } = useParams();

    const backendUrl = "https://localhost:7124/uploads/";
    const loggedInUserId = localStorage.getItem("userId");
    
    // If there's no ID in the URL, we assume it's the logged-in user's own profile
    const isOwnProfile = !id || id === loggedInUserId;

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem("token");
            const targetUserId = id || loggedInUserId;

            // 🛑 GUARD: If we have no ID at all, don't fetch
            if (!targetUserId || targetUserId === "undefined") {
                console.warn("No target user ID found for profile fetch.");
                return;
            }

            if (!token) {
                navigate("/signIn");
                return;
            }

            try {
                // 1. Fetch Profile Info
                const profileResponse = await fetch(`https://localhost:7124/api/profile/${targetUserId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (profileResponse.status === 404 && isOwnProfile) {
                    navigate("/editProfile");
                    return;
                }

                if (profileResponse.ok) {
                    const data = await profileResponse.json();
                    
                    // structure state properly based on your backend DTO
                    setProfile({
                        ...(data.profile || data), 
                        followersCount: data.followersCount || 0,
                        followingCount: data.followingCount || 0
                    });
                    
                    // Set following status if your backend provides it
                    if (data.isFollowing !== undefined) setIsFollowing(data.isFollowing);
                }

                // 2. Fetch User's Posts
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
    }, [id, loggedInUserId, navigate, isOwnProfile]); // Re-run when ID changes

    if (!profile && !loadingPosts) {
        return <div className="loading">Profile not found. 😕</div>;
    }

    if (!profile) {
        return <div className="loading">Loading Profile... ⏳</div>;
    }

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
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <div className="profile-layout">
            <Navigation />
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-header">
                        <img 
                            src={profile.imageUrl ? `${backendUrl}${profile.imageUrl}` : "https://picsum.photos/120"}
                            className="profileImg"
                            alt="Profile"
                            onError={(e) => { e.target.src = "https://picsum.photos/120"; }}
                        />
                        <div className="profile-info">
                            <span className="userName">{profile.name} {profile.surName}</span>
                            <small className="userHandle">@{profile.handleName || "user"}</small>
                            <small className="bio">{profile.bio || "No bio yet."}</small>

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
                                        <button className="shareBut">Share Profile</button>
                                        <button className="accountBtn" onClick={() => navigate("/settings")}>
                                            Settings <Settings size={16}/>
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
                            <span className="stat-number">{profile.followersCount || 0}</span>
                            <span className="stat-label">Followers</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{profile.followingCount || 0}</span>
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
                        userPosts.length > 0 ? (
                            userPosts.map((post) => (
                                <div key={post.id} className="card">
                                    <img 
                                        src={post.mediaUrl?.startsWith("http") ? post.mediaUrl : `${backendUrl}${post?.mediaUrl}`}
                                        alt={post.title} 
                                        className="listing-thumb"
                                        onError={(e) => { e.target.src = "https://picsum.photos/300/400"; }}
                                    />
                                    <div className="card-info">
                                        <small className="price">R{post.price}</small>
                                        {isOwnProfile && (
                                            <button className="delete-btn" onClick={() => handleDelete(post.id)}>Delete</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-posts">No listings found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;