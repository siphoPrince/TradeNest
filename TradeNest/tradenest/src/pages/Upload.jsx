import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Navigation from "../components/Navigation";
import "../styles/Upload.css";

const Upload = () => {
  const [files, setFiles] = useState([]);

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
              <input type="text" className="title-input" placeholder="What are you selling..." />
            </div>

            <div className="inputs">
              <label>Description</label>
              <textarea
                className="Description-input"
                placeholder="Describe in details..."
                rows="4"
              />
            </div>

            <div className="inputs">
              <label>Price</label>
              <input type="text" className="Price-input" placeholder="R 0.00" />
            </div>

            <button className="uploadBut">Upload Item</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;