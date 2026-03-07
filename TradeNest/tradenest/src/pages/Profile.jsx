import "../styles/Profile.css";
import Navigation from "../components/Navigation";
import { useState } from "react";

const Profile = () => {
    const [showMenu, setShowMenu] = useState(false);

    return(
        <div className="profile-layout">
            <Navigation />
            <div className="profile-page">
                <div className="profile-container">
                    {/* PROFILE HEADER */}
                    <div className="profile-header">
                        <img 
                            src="https://picsum.photos/120" 
                            alt="profile" 
                            className="profileImg" 
                        />
                        <div className="profile-info">
                            <span className="userName">Sipho Mabirimise</span>
                            <small className="userHandle">@mabirimise</small>
                            <small className="bio">Software Engineer</small>
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

                        <button className="editBut">
                            Edit Profile
                        </button>

                        <button className="shareBut">
                            Share Profile
                        </button>

                        {/* SETTINGS MENU */}
                    <div className="accountMenu">

                        <button 
                            className="accountBtn"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            Account
                        </button>

                        {showMenu && (
                            <div className="dropdownMenu">

                                <div className="menuItem">My Orders</div>
                                <div className="menuItem">My Wishlist</div>
                                <div className="menuItem">My Reviews</div>
                                <div className="menuItem">Settings</div>

                                <hr />

                                <button className="logout">
                                    Logout
                                </button>

                            </div>
                        )}

                    </div>

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