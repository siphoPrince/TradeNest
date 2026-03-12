import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Navigation from "../components/Navigation";
import "../styles/Upload.css";

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0)
  const [categoryId, setCategoryId] = useState(1);

  const handleUpload = async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("Please log in first!");

  // Decode token to get the real User ID 🆔
  const payload = JSON.parse(atob(token.split('.')[1]));
  const currentUserId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  console.log("Extracted User ID:", currentUserId);

  const formData = new FormData();
  
  // Pack the envelope ✉️
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("categoryId", categoryId);
  formData.append("userId", currentUserId);
  
  if (files.length > 0) {
    formData.append("file", files[0]); 
  }

  try {
    const response = await fetch("https://localhost:7124/api/uploads/create-post", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
        // No Content-Type header! The browser handles it for FormData.
      },
      body: formData,
    });

    if (response.ok) {
      alert("Product uploaded to feed! 🚀");
      // You could redirect to the feed here
    } else {
      const error = await response.text();
      alert("Upload failed: " + error);
    }
  } catch (err) {
    console.error("Network error:", err);
  }
};

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [
      ...prev,
      ...acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
    },
  });

  const removeFile = (name) => {
    setFiles(files.filter((file) => file.name !== name));
  };

  return (
    <div className="upload-layout">
      {/* Sidebar Navigation */}
      <Navigation />

      {/* Main Upload Content */}
      <div className="upload-page">
        <div className="upload-container">
          <h2>Upload Product</h2>

          <div className="upload-section">
            {/* Dropzone Area */}
            <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
              <input {...getInputProps()} />
              <div className="upload-placeholder">
                <p>
                  Drag & drop photos/videos or <span>Browse</span>
                </p>
                <small>Upload up to 5 files</small>
              </div>
            </div>

            {/* Preview Grid */}
            <div className="upload-grid">
              {files.map((file) => (
                <div key={file.name} className="preview-card">
                  {file.type.startsWith("video") ? (
                    <video src={file.preview} />
                  ) : (
                    <img src={file.preview} alt="preview" />
                  )}
                  <button className="remove-btn" onClick={() => removeFile(file.name)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-content">
            <div className="inputs">
              <label>Title</label>
              <input 
                type="text"
                className="title-input"
                value={title}
                onChange={(e)=> setTitle(e.target.value)}
                placeholder="What are you selling..." />
            </div>

            <div className="inputs">
              <label>Description</label>
              <textarea
                className="Description-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe in details..."
                rows="4"
              />
            </div>

            <div className="inputs">
              <label>Price</label>
              <input 
                type="number"
                className="Price-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="R 0.00" />
            </div>

            <div className="inputs">
              <label>Category</label>
              <select 
                className="category-input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}>
                <option value="1">Electronics</option>
                <option value="2">Clothing</option>
                <option value="3">Home</option>
              </select>
            </div>

            <button className="uploadBut" onClick={handleUpload}>Upload Item</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;