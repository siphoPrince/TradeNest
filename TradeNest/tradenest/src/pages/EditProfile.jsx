import "../styles/Profile.css";
import Navigation from "../components/Navigation";
import { useState, useEffect, useRef } from "react";
import "../styles/EditProfile.css"

const EditProfile = () => {

    const fileInputRef = useRef(null);
    const userId = 1002;

    const [profile, setProfile] = useState({
        id: "",
        name: "",
        surName: "",
        bio: "",
        phone: "",
        imageUrl: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetch("https://localhost:7124/api/profile/1");
            const data = await res.json();
            setProfile(data);
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    /* OPEN FILE PICKER WHEN IMAGE CLICKED */
    const openFilePicker = () => {
        fileInputRef.current.click();
    };

    /* HANDLE IMAGE SELECTION */
    const handleImageUpload = (e) => {

        const file = e.target.files[0];

        if(!file) return;

        const preview = URL.createObjectURL(file);

        setProfile({
            ...profile,
            imageUrl: preview
        });
    };

    const updateProfile = async () => {

        await fetch(`https://localhost:7124/api/profile/${userId}}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(profile)
        });

        alert("Profile updated!");
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