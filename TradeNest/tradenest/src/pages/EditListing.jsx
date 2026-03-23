import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import "../styles/EditListing.css"

const EditListing = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        categoryId: ""
    });
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            const response = await fetch(`https://localhost:7124/api/posts/${id}`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    categoryId: data.categoryId || "1"
                });
                // Shows existing image from your server
                setPreviewUrl(`https://localhost:7124/uploads/${data.mediaUrl}`);
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    // Function to handle the image selection and preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // This shows the new image instantly
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        // 1. We switch to FormData because JSON can't carry image files
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("categoryId", formData.categoryId);

        // 2. Only add the image if the user actually picked a new one
        if (selectedFile) {
            data.append("image", selectedFile); 
        }

        try {
            const response = await fetch(`https://localhost:7124/api/posts/${id}`, {
                method: 'PUT',
                headers: {
                    // DO NOT set 'Content-Type': 'application/json' here! 
                    // Let the browser set it automatically for FormData.
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            if (response.ok) {
                navigate("/manage"); 
            } else {
                alert("Failed to update listing.");
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    if (loading) return <div className="loading">Loading listing details...</div>;

    return (
        <div className="profile-layout">
            <Navigation />
            <div className="settings-container">
                <div className="settings-header">
                    <h3>Edit Listing</h3>
                    <p>Update your item details, price, and category.</p>
                </div>

                <form className="settings-card" onSubmit={handleUpdate}>
                    
                    {/* --- Image Section --- */}
                    <div className="form-group">
                        <label>Listing Image</label>
                        <div className="image-preview-wrapper">
                            {previewUrl && (
                                <img src={previewUrl} alt="Preview" className="edit-image-preview" />
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="file-input-custom"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Listing Title</label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Price (ZAR)</label>
                        <input 
                            type="number" 
                            value={formData.price} 
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            rows="4"
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="settings-footer">
                        <button type="button" className="btn-icon-delete" onClick={() => navigate("/manage")}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditListing;