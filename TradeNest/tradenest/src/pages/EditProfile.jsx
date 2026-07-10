import "../styles/Profile.css";
import "../styles/EditProfile.css";
import Navigation from "../components/Navigation";
import Toast from "../components/Toast"; // Imported Custom Toast Notification
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Camera, ChevronLeft, Loader2 } from 'lucide-react';

const EditProfile = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const backendUrl = "https://cylosocials.co.za/uploads/";

    const [profile, setProfile] = useState({
        id: 0,
        name: "",
        surName: "",
        handleName: "",
        bio: "",
        phone: "",
        imageUrl: "",
        suburb: "", 
        city: "",
        province: "",
        latitude: null,
        longitude: null
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    // Pure JavaScript Toast Notification State Management
    const [toast, setToast] = useState(null);

    const showToast = (message, type) => {
        setToast({ message, type });
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const storedUserId = localStorage.getItem("userId");
            const token = localStorage.getItem("token");

            if (!storedUserId || !token) {
                navigate("/signIn");
                return;
            }

            try {
                const res = await fetch(`https://cylosocials.co.za/api/profile/${storedUserId}`, {
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
                        suburb: p.suburb || "", 
                        city: p.city || "",
                        province: p.province || "",
                        latitude: p.latitude ?? null,
                        longitude: p.longitude ?? null
                    });
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                showToast("Failed to load profile settings.", "error");
            }
        };
        fetchProfile();
    }, [navigate]);

    const getLocation = () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser.", "error");
            return;
        }
        setIsLocating(true);
        showToast("Fetching location from GPS satellite...", "info");

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                );
                const data = await response.json();
                const addr = data.address || {};
                
                const detectedSuburb = addr.suburb || addr.neighbourhood || addr.residential || "";
                const detectedCity = addr.city || addr.town || addr.city_district || addr.municipality || "Unknown Location";
                const province = addr.state || "";

                setProfile(prev => ({
                    ...prev,
                    suburb: detectedSuburb,
                    city: detectedCity,
                    province: province,
                    latitude: latitude,
                    longitude: longitude
                }));

                const locationAlertText = detectedSuburb 
                    ? `Found you near ${detectedSuburb}, ${detectedCity}! 📍` 
                    : `Found you near ${detectedCity}! 📍`;
                
                showToast(locationAlertText, "success");
            } catch (error) {
                console.error("Error naming the location:", error);
                showToast("Coordinates saved, but failed resolving area names.", "error");
            } finally {
                setIsLocating(false);
            }
        }, () => {
            showToast("Location access denied. Check browser permissions.", "error");
            setIsLocating(false);
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "handleName") {
            const sanitizedHandle = value.replace(/\s+/g, ""); 
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
        showToast("Avatar preview updated locally!", "success");
    };

    const updateProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/signIn");

        const formData = new FormData();
        
        formData.append("Id", profile.id.toString());
        formData.append("Name", profile.name || "");
        formData.append("SurName", profile.surName || "");
        formData.append("HandleName", profile.handleName || "");
        formData.append("Bio", profile.bio || "");
        formData.append("Phone", profile.phone || "");
        formData.append("Suburb", profile.suburb || ""); 
        formData.append("City", profile.city || "");
        formData.append("Province", profile.province || "");

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
            const response = await fetch(`https://cylosocials.co.za/api/profile/save`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                showToast("Profile saved successfully! 🚀", "success");
                setTimeout(() => {
                    navigate("/profile");
                }, 1200);
            } else {
                const errorData = await response.json();
                console.error("Server Error details:", errorData);
                showToast(`Save failed: Check input parameters.`, "error");
            }
        } catch (error) {
            console.error("Network Error:", error);
            showToast("Connection error. Is your API backend running?", "error");
        }
    };

    return (
        <div className="profile-layout">
            <Navigation />
            
            {/* Dynamic Toast Portal Anchor */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

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
                        <textarea className="modern-textarea" name="bio" value={profile.bio || ""} onChange={handleChange} placeholder="Tell your story..." rows={4} />
                    </div>

                    <div className="edit-card">
                        <label>Location Details</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
                                <input 
                                    className="modern-input" 
                                    name="suburb" 
                                    value={profile.suburb || ""} 
                                    onChange={handleChange} 
                                    placeholder="Suburb (e.g. Sandton)" 
                                    style={{ flex: 1 }}
                                />
                                <input 
                                    className="modern-input" 
                                    name="city" 
                                    value={profile.city || ""} 
                                    onChange={handleChange} 
                                    placeholder="City (e.g. Johannesburg)" 
                                    style={{ flex: 1 }}
                                />
                            </div>
                            <button className="geo-btn" onClick={getLocation} disabled={isLocating} style={{ height: '44px', width: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {isLocating ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
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