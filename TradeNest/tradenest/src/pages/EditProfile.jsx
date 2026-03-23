import "../styles/Profile.css";
import Navigation from "../components/Navigation";
import { useState, useEffect, useRef } from "react";
import "../styles/EditProfile.css"
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    
    // Change this to your actual backend URL
    const backendUrl = "https://localhost:7124/uploads/";

    const [profile, setProfile] = useState({
        id: 0,
        name: "",
        surName: "",
        handleName: "",
        bio: "",
        phone: "",
        imageUrl: ""
    });

    const [selectedFile, setSelectedFile] = useState(null);

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
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    // Note: C# returns { profile: {...}, followersCount: x, ... }
                    const p = data.profile; 

                    setProfile({
                        id: p.id || 0,
                        name: p.name || "",
                        surName: p.surName || "",
                        handleName: p.handleName || "",
                        bio: p.bio || "",
                        phone: p.phone || "",
                        imageUrl: p.imageUrl || ""
                    });
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setSelectedFile(file); 
        const preview = URL.createObjectURL(file); 
        setProfile({ ...profile, imageUrl: preview });
    };

    const updateProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/signIn");

        const formData = new FormData();
        // We append using the exact names expected by the C# Profile Model
        formData.append("Id", profile.id);
        formData.append("Name", profile.name);
        formData.append("SurName", profile.surName);
        formData.append("HandleName", profile.handleName);
        formData.append("Bio", profile.bio);
        formData.append("Phone", profile.phone);
        
        if (selectedFile) {
            formData.append("imageFile", selectedFile); 
        }

        try {
            const response = await fetch(`https://localhost:7124/api/profile/save`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                alert("Profile saved successfully! 🚀");
                navigate("/profile");
            } else {
                const errorData = await response.json();
                console.error("Server Error:", errorData);
            }
        } catch (error) {
            console.error("Network Error:", error);
        }
    };

    return (
        <div className="profile-layout">
            <Navigation />
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-header">
                        <img 
                            src={
                                profile.imageUrl 
                                    ? (profile.imageUrl.startsWith("blob:") 
                                        ? profile.imageUrl 
                                        : `${backendUrl}${profile.imageUrl}`)
                                    : "https://picsum.photos/120"
                            } 
                            className="profileImg" 
                            onClick={() => fileInputRef.current.click()} 
                            alt="Profile"
                            title="Click to change photo"
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={handleImageUpload}
                        />

                        <div className="profile-info">
                            <input className="edit-input name-input" name="name" value={profile.name || ""} onChange={handleChange} placeholder="First name" />
                            <input className="edit-input name-input" name="handleName" value={profile.handleName || ""} onChange={handleChange} placeholder="@Handle" />
                            <input className="edit-input name-input" name="surName" value={profile.surName || ""} onChange={handleChange} placeholder="Surname" />
                            <textarea className="edit-bio" name="bio" value={profile.bio || ""} onChange={handleChange} placeholder="Bio..." />
                        </div>
                    </div>

                    <div className="edit-section">
                        <h3>Contact</h3>
                        <input className="edit-input" name="phone" value={profile.phone || ""} onChange={handleChange} placeholder="Phone number" />
                    </div>

                    <div className="profile-actions">
                        <button className="saveBut" onClick={updateProfile}>Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;