import "../styles/Profile.css";
import "../styles/EditProfile.css";
import Navigation from "../components/Navigation";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Camera, ChevronLeft } from 'lucide-react';

const EditProfile = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const backendUrl = "https://localhost:7124/uploads/";

    const [profile, setProfile] = useState({
        id: 0,
        name: "",
        surName: "",
        handleName: "",
        bio: "",
        phone: "",
        imageUrl: "",
        city: "",
        province: "",
        latitude: null,
        longitude: null
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

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
                    const p = data.profile; 

                    setProfile({
                        id: p.id || 0,
                        name: p.name || "",
                        surName: p.surName || "",
                        handleName: p.handleName || "",
                        bio: p.bio || "",
                        phone: p.phone || "",
                        imageUrl: p.imageUrl || "",
                        city: p.city || "",
                        province: p.province || "",
                        latitude: p.latitude ?? null,
                        longitude: p.longitude ?? null
                    });
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            }
        };
        fetchProfile();
    }, [navigate]);

    const getLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                );
                const data = await response.json();
                const city = data.address.city || data.address.town || data.address.suburb || "Unknown City";
                const province = data.address.state || "";

                setProfile(prev => ({
                    ...prev,
                    city: city,
                    province: province,
                    latitude: latitude,
                    longitude: longitude
                }));
                alert(`Found you in ${city}!`);
            } catch (error) {
                console.error("Error naming the location:", error);
                alert("Coordinates saved, but city name could not be fetched.");
            } finally {
                setIsLocating(false);
            }
        }, () => {
            alert("Location access denied.");
            setIsLocating(false);
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If the user is editing the handle, strip out spaces
        if (name === "handleName") {
            const sanitizedHandle = value.replace(/\s+/g, ""); // Removes all spaces
            setProfile({ ...profile, [name]: sanitizedHandle });
        } else {
            setProfile({ ...profile, [name]: value });
        }
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
        
        // Ensure values are strings and not 'undefined'
        formData.append("Id", profile.id.toString());
        formData.append("Name", profile.name || "");
        formData.append("SurName", profile.surName || "");
        formData.append("HandleName", profile.handleName || "");
        formData.append("Bio", profile.bio || "");
        formData.append("Phone", profile.phone || "");
        formData.append("City", profile.city || "");
        formData.append("Province", profile.province || "");

        // CRITICAL: Only append if they are actual numbers
        if (profile.latitude !== null && profile.latitude !== undefined) {
            formData.append("Latitude", profile.latitude.toString());
        }
        if (profile.longitude !== null && profile.longitude !== undefined) {
            formData.append("Longitude", profile.longitude.toString());
        }

        if (selectedFile) {
            formData.append("imageFile", selectedFile); 
        }

        try {
            const response = await fetch(`https://localhost:7124/api/profile/save`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`
                    // DO NOT set Content-Type header when sending FormData; 
                    // the browser will set it automatically with the boundary.
                },
                body: formData
            });

            if (response.ok) {
                alert("Profile saved successfully! 🚀");
                navigate("/profile");
            } else {
                const errorData = await response.json();
                console.error("Server Error details:", errorData);
                alert(`Save failed: ${JSON.stringify(errorData.errors || "Unknown Error")}`);
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("Connection error. Is the server running?");
        }
    };

    return (
        <div className="profile-layout">
            <Navigation />
            <div className="edit-profile-wrapper">
                <header className="edit-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} /> Back
                    </button>
                    <h2>Edit Profile</h2>
                </header>

                <div className="edit-container">
                    <div className="edit-hero">
                        <div className="profile-upload-container">
                            <img 
                                src={profile.imageUrl ? (profile.imageUrl.startsWith("blob:") ? profile.imageUrl : `${backendUrl}${profile.imageUrl}`) : "https://picsum.photos/120"} 
                                className="profile-preview" 
                                alt="Profile"
                            />
                            <button className="camera-overlay" onClick={() => fileInputRef.current.click()}>
                                <Camera size={18} color="white" />
                            </button>
                            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleImageUpload} />
                        </div>

                        <div className="main-fields">
                            <div className="input-group">
                                <label>Name & Surname</label>
                                <div className="name-row">
                                    <input className="modern-input" name="name" value={profile.name || ""} onChange={handleChange} placeholder="First name" />
                                    <input className="modern-input" name="surName" value={profile.surName || ""} onChange={handleChange} placeholder="Surname" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Username</label>
                                <input className="modern-input handle-text" name="handleName" value={profile.handleName || ""} onChange={handleChange} placeholder="@handle" />
                            </div>
                        </div>
                    </div>

                    <div className="edit-card">
                        <label>Bio</label>
                        <textarea className="modern-textarea" name="bio" value={profile.bio || ""} onChange={handleChange} placeholder="Tell your story..." rows="4" />
                    </div>

                    <div className="edit-card">
                        <label>Location</label>
                        <div className="location-field-wrapper">
                            <input className="modern-input" name="city" value={profile.city || ""} onChange={handleChange} placeholder="City (e.g. Johannesburg)" />
                            <button className="geo-btn" onClick={getLocation} disabled={isLocating}>
                                {isLocating ? "..." : <MapPin size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="edit-card">
                        <label>Contact Phone</label>
                        <input className="modern-input" name="phone" value={profile.phone || ""} onChange={handleChange} placeholder="Phone number" />
                    </div>

                    <div className="footer-actions">
                        <button className="cancel-btn" onClick={() => navigate("/profile")}>Cancel</button>
                        <button className="save-btn" onClick={updateProfile}>Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;