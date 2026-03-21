import "../styles/Profile.css";
import "../styles/Follow.css"
import Navigation from "../components/Navigation";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";


const Profile = () => {
    const [showPosts, setShowPosts] = useState(false);
    const [userPosts, setUserPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [profile, setProfile] = useState(null); 
    const navigate = useNavigate();
    const { id } = useParams();

    const userId = localStorage.getItem("userId");
    const isOwnProfile = !id || id === userId;

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            const storedUserId = localStorage.getItem("userId");
            const targetUserId = id || storedUserId;
            

            // Check if we have our "keys"
            if (!token || !storedUserId) {
                console.warn("User is not authenticated. Redirecting...");
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

                const profileData = await profileResponse.json();
                setProfile(profileData);

                // 2. Fetch User's Posts 🚀
                setLoadingPosts(true); // Start the listing loader
                const postsResponse = await fetch(`https://localhost:7124/api/posts/user/${targetUserId}?pageNumber=1&pageSize=10`);
                
                if (postsResponse.ok) {
                  const postsData = await postsResponse.json();
                   // Remember: your API returns a PagedResponse, so the array is in .data
                   setUserPosts(postsData.data || []); 
                  }


                const response = await fetch(`https://localhost:7124/api/profile/${targetUserId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    }
                });

                // 1. Check for the specific "Not Found" status
                if (response.status === 404) {
                    console.info("New user detected. Redirecting to onboarding...");
                    navigate("/editProfile"); // Redirect to the form
                    return; 
                }

                // 2. Handle other errors (like 500 or 401)
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setProfile(data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally{
                setLoadingPosts(false);
            }
        };

        fetchProfile();
    }, [id, navigate, isOwnProfile]); // navigate is a stable dependency

    // 3. Show a loading state until the profile data arrives
    if (!profile) {
        return <div className="loading">Loading Profile... ⏳</div>;
    }

    console.log("Follow button clicked for ID:", id);
    const handleFollow = async () => {
    const token = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("userId");

    try {
        const response = await fetch(`https://localhost:7124/api/follow/${id}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'UserId': currentUserId // Matches your controller's manual header check
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Update the UI state based on the backend response
            setIsFollowing(data.isFollowing);
            
            setProfile(prev => ({
                    ...prev,
                    followersCount: data.isFollowing 
                        ? prev.followersCount + 1 
                        : prev.followersCount - 1
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
            // Remove the deleted post from the UI state immediately
            setUserPosts(userPosts.filter(post => post.id !== postId));
        } else {
            alert("Failed to delete post.");
        }
    } catch (error) {
        console.error("Delete error:", error);
    }
};
    return(
        <div className="profile-layout">
            <Navigation />
            <div className="profile-page">
                <div className="profile-container">
                    {/* PROFILE HEADER */}
                    <div className="profile-header">
                        <img 
                            src={profile.profile?.imageUrl || "https://picsum.photos/120"}
                            className="profileImg"
                            alt="Profile"
                        />
                        <div className="profile-info">
                            <span className="userName">{profile.profile?.name} {profile.profile?.surName}</span>
                            <small className="userHandle">{profile.profile?.handleName}</small>
                            <small className="bio">{profile.profile?.bio}</small>

                            {/* ACTION BUTTONS */}
                   <div className="profile-actions">

                        {/* 1. Use a Ternary (?) for the Edit vs Follow choice */}
                        {isOwnProfile ? (
                            <button
                                className="editBut"
                                onClick={() => navigate("/editProfile")}>
                                Edit Profile
                            </button>
                        ) : (
                            <button 
                                className={isFollowing ? "followingBut" : "followBut"} 
                                onClick={handleFollow}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                        )}

                        {/* 2. Use Logical AND (&&) for things that only show for you */}
                        {isOwnProfile && (
                            <>
                                <button className="shareBut">
                                    Share Profile
                                </button>

                                <div className="accountMenu">
                                    <button 
                                        className="accountBtn"
                                        onClick={() => navigate("/account")}
                                    >
                                        Account & Banking
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                        </div>
                    </div>


                    {/* STATS */}
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

                    {/* USER LISTINGS */}
                    <div className="user-listings">

                        <h2 className="listing-title">My Listings</h2>

                        <div className="listingContainer">
                        {/* 1. We check if there are any posts to show */}
                        {userPosts.length > 0 ? (
                            userPosts.map((post) => (
                                /* 2. We provide a unique key so React can track each item 🔑 */
                                <div key={post.id} className="card">
                                    <img 
                                        src={`https://localhost:7124/uploads/${post?.mediaUrl}`}
                                        alt={post.title} 
                                        onError={(e) => { e.target.src = "https://picsum.photos/300/400"; }}
                                    />
                                    <small className="price">R{post.price}</small>

                                    {isOwnProfile && (
                                        <button 
                                            className="delete-btn" 
                                            onClick={() => handleDelete(post.id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            /* 4. A fallback message for users who haven't posted yet 📭 */
                            <p className="no-posts">This user hasn't posted any listings yet.</p>
                        )}
                        </div>                     

                            

                    </div>

                </div>
            </div>
    
    );
}

export default Profile;