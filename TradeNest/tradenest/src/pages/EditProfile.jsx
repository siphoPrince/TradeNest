import "../styles/Profile.css";
import Navigation from "../components/Navigation";
import { useState, useEffect, useRef } from "react";
import "../styles/EditProfile.css"
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        id: 0,
        name: "",
        surName: "",
        bio: "",
        phone: "",
        imageUrl: ""
    });

    // 1. Load the profile when the page opens
    useEffect(() => {
        const fetchProfile = async () => {
            const storedUserId = localStorage.getItem("userId");
            const token = localStorage.getItem("token");

            if (!storedUserId || !token) {
                navigate("/signIn");
                return;
            }

            try {
                const res = await fetch(`https://localhost:7124/api/profile/${storedUserId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    const openFilePicker = () => {
        fileInputRef.current.click();
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const preview = URL.createObjectURL(file);
        setProfile({
            ...profile,
            imageUrl: preview
        });
    };

    // 2. The Updated "Smart Save" function
    const updateProfile = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please log in again.");
            navigate("/signIn");
            return;
        }

        try {
            // We hit the NEW /save endpoint we just made in C#
            const response = await fetch(`https://localhost:7124/api/profile/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                // We send the whole profile. The C# backend will ignore the 
                // empty "id" string and use the token to set the UserId.
                body: JSON.stringify(profile)
            });

            if (response.ok) {
                alert("Profile saved successfully! 🚀");
                navigate("/profile");
            } else if (response.status === 401) {
                alert("Session expired. Please log in again.");
                navigate("/signIn");
            } else {
                const errorData = await response.json();
                console.error("Server Error:", errorData);
                alert("Failed to save profile. Check console for details.");
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("Could not connect to the server.");
        }
    };
    
    


    return(
        <div className="profile-layout">

            <Navigation />

            <div className="profile-page">

                <div className="profile-container">

                    {/* HEADER PREVIEW */}
                    <div className="profile-header">

                        {/* CLICKABLE IMAGE */}
                        <img 
                            src={profile.imageUrl || "https://picsum.photos/120"}
                            alt="profile"
                            className="profileImg"
                            onClick={openFilePicker}
                            title="Click to change photo"
                        />

                        {/* HIDDEN FILE INPUT */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageUpload}
                        />

                        <div className="profile-info">

                            <input
                                className="edit-input name-input"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                placeholder="First name"
                            />

                            <input
                                className="edit-input name-input"
                                name="surName"
                                value={profile.surName}
                                onChange={handleChange}
                                placeholder="Surname"
                            />

                            <textarea
                                className="edit-bio"
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                placeholder="Tell people about what you sell..."
                            />

                        </div>

                    </div>


                    {/* CONTACT */}
                    <div className="edit-section">

                        <h3>Contact</h3>

                        <input
                            className="edit-input"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            placeholder="Phone number"
                        />

                    </div>


                    {/* ACTION BUTTONS */}
                    <div className="profile-actions">

                        <button
                            className="saveBut"
                            onClick={updateProfile}
                        >
                            Save Changes
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default EditProfile;