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

    // 1. Fetch existing data
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
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    // 2. Handle Update
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://localhost:7124/api/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
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