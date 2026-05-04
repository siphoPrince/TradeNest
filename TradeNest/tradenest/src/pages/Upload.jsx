import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navigation from "../components/Navigation";
import "../styles/Upload.css";

const Upload = () => {
  const navigate = useNavigate();

  // Form States
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState(1);
  const [quantity, setQuantity] = useState(1);

  // NEW: UI Feedback States
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(""); 
  const [errorMessage, setErrorMessage] = useState(""); // ⚠️ Show error on page

  const handleUpload = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in first!");

    setErrorMessage(""); 
    
    if (files.length === 0) {
        setErrorMessage("Please select a file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("categoryId", categoryId);
    formData.append("file", files[0]); // Sending the file
    formData.append("latitude", 0);    // Default for now
    formData.append("longitude", 0);   // Default for now

    // NOTE: We stopped sending userId manually because the 
    // updated Controller pulls it safely from the JWT token.

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Preparing your post...");

    try {
      const response = await axios.post("https://localhost:7124/api/uploads/create-post", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          
          // Smooth the transition: keep it at 95% while Azure/SQL work
          if (percentCompleted < 100) {
            setUploadProgress(percentCompleted);
            setUploadStatus(`Uploading to Cylo... ${percentCompleted}%`);
          } else {
            setUploadProgress(95); 
            setUploadStatus("Finalizing on Azure Cloud... ☁️");
          }
        },
      });

      if (response.status === 200) {
        setUploadProgress(100);
        setUploadStatus("Post Created Successfully! 🚀");
        
        // Short delay so the user actually sees the 100% success state
        setTimeout(() => {
          setIsUploading(false);
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("Upload error details:", err);
      setIsUploading(false);
      
      const backendError = err.response?.data?.message || "Something went wrong. Please check your connection.";
      setErrorMessage(`Upload Failed: ${backendError}`);
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
    accept: { "image/*": [], "video/*": [] },
    multiple: false
  });

  const removeFile = (name) => {
    setFiles(files.filter((file) => file.name !== name));
  };

  return (
    <div className="upload-layout">
      <Navigation />

      {/* PROGRESS OVERLAY */}
      {isUploading && (
        <div className="upload-overlay">
          <div className="loader-card">
            <div className="spinner"></div>
            <h3>{uploadStatus}</h3>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p>{uploadProgress}% Uploaded</p>
          </div>
        </div>
      )}

      <div className="upload-page">
        <div className="upload-container">
          <h2>Upload Product</h2>

          {/* ⚠️ ERROR MESSAGE BOX */}
          {errorMessage && (
            <div className="error-banner">
              <p>❌ {errorMessage}</p>
              <button onClick={() => setErrorMessage("")}>&times;</button>
            </div>
          )}

          <div className="upload-section">
            <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
              <input {...getInputProps()} />
              <div className="upload-placeholder">
                <p>Drag & drop photos/videos or <span>Browse</span></p>
              </div>
            </div>

            <div className="upload-grid">
              {files.map((file) => (
                <div key={file.name} className="preview-card">
                  {file.type.startsWith("video") ? (
                    <video src={file.preview} />
                  ) : (
                    <img src={file.preview} alt="preview" />
                  )}
                  <button className="remove-btn" onClick={() => removeFile(file.name)}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-content">
            {/* ... keeping your existing inputs ... */}
            <div className="inputs">
              <label>Title</label>
              <input type="text" value={title} onChange={(e)=> setTitle(e.target.value)} placeholder="What are you selling..." />
            </div>

            <div className="inputs">
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe in details..." rows="4" />
            </div>

            <div className="inputs">
              <label>Price</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>

            <div className="inputs">
              <label>Quantity</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>

            <div className="inputs">
              <label>Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="1">Electronics</option>
                <option value="2">Clothing</option>
                <option value="3">Home</option>
              </select>
            </div>

            <button 
              className="uploadBut" 
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? "Please Wait..." : "Upload Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;