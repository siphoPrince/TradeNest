import "../styles/Profile.css";
import Navigation from "../components/Navigation";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";


const Profile = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [profile, setProfile] = useState(null); // 1. Start with null to check for data
    const navigate = useNavigate();
    const { id } = useParams();
    console.log("Type of ID:", typeof id)

    // 2. Get userId at the top level
    const userId = localStorage.getItem("userId");
    const isOwnProfile = !id || id === userId;

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            const storedUserId = localStorage.getItem("userId");

            const targetUserId = id || storedUserId;
            console.log("ID from URL:", id);
            console.log("ID from LocalStorage:", storedUserId);
            console.log("Final Target ID:", targetUserId);

            // Check if we have our "keys"
            if (!token || !storedUserId) {
                console.warn("User is not authenticated. Redirecting...");
                navigate("/signIn");
                return;
            } 

            try {
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
            }
        };

        fetchProfile();
    }, [id, navigate]); // navigate is a stable dependency

    // 3. Show a loading state until the profile data arrives
    if (!profile) {
        return <div className="loading">Loading Profile... ⏳</div>;
    }



    return(
        <div className="profile-layout">
            <Navigation />
            <div className="profile-page">
                <div className="profile-container">
                    {/* PROFILE HEADER */}
                    <div className="profile-header">
                        <img 
                            src={profile.imageUrl || "https://picsum.photos/120"}
                            className="profileImg" 
                        />
                        <div className="profile-info">
                            <h1>Profile of User {id}</h1>
                            <span className="userName">{profile.name} {profile.surName}</span>
                            <small className="userHandle">@mabirimise</small>
                            <small className="bio">{profile.bio}</small>
                        </div>
                    </div>


                    {/* STATS */}
                    <div className="profile-stats">

                        <div className="stat">
                            <span className="stat-number">24</span>
                            <span className="stat-label">Listings</span>
                        </div>

                        <div className="stat">
                            <span className="stat-number">500</span>
                            <span className="stat-label">Followers</span>
                        </div>

                        <div className="stat">
                            <span className="stat-number">4000</span>
                            <span className="stat-label">Following</span>
                        </div>

                        <div className="stat">
                            <span className="stat-number">85</span>
                            <span className="stat-label">Sold</span>
                        </div>

                    </div>


                    {/* ACTION BUTTONS */}
                    <div className="profile-actions">

                        {isOwnProfile && (
                            <button
                                className="editBut"
                                onClick={() => navigate("/editProfile")}>
                                Edit Profile
                            </button>
                        )}

                        {isOwnProfile && (
                            <button className="shareBut">
                                Share Profile
                            </button>
                        )}

                        {/* SETTINGS MENU */}
                        {isOwnProfile && (
                            <div className="accountMenu">
                                <button 
                                    className="accountBtn"
                                    onClick={() => setShowMenu(!showMenu)}
                                >
                                    Account
                                </button>

                                {showMenu && (
                                    <div className="dropdownMenu">
                                        {/* ... your menu items ... */}
                                    </div>
                                )}
                            </div>
                        )}
                        

                    </div>

                    {/* USER LISTINGS */}
                    <div className="user-listings">

                        <h2 className="listing-title">My Listings</h2>

                        <div className="listingContainer">

                            <div className="card">
                                <img src="https://picsum.photos/300/400" alt="Product" />
                                <small className="price">R1200</small>
                            </div>

                            <div className="card">
                                <img src="https://picsum.photos/301/400" alt="Product" />
                                <small className="price">R950</small>
                            </div>

                            <div className="card">
                                <img src="https://picsum.photos/302/400" alt="Product" />
                                <small className="price">R1200</small>
                            </div>

                            <div className="card">
                                <img src="https://picsum.photos/303/400" alt="Product" />
                                <small className="price">R800</small>
                            </div>

                        </div>

                    </div>

                    


                </div>

            </div>
        </div>
    );
}

export default Profile;