import React, { useState, useCallback, useRef } from "react"; 
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { Camera, Upload as UploadIcon, X, Radio, Square } from "lucide-react"; 
import axios from "axios";
import Navigation from "../components/Navigation";
import "../styles/Upload.css";

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 
  const videoPreviewRef = useRef(null); // Added for in-app camera viewfinder feed
  const mediaRecorderRef = useRef(null); // Track runtime recording instances
  
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  // Form States
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState(1);
  const [quantity, setQuantity] = useState(1);

  // UI Feedback States
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(""); 
  const [errorMessage, setErrorMessage] = useState("");

  // Live Recording Control Engine States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  
  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(",", "");
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleUpload = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in first!");

    setErrorMessage(""); 
    
    if (files.length === 0) {
        setErrorMessage("Please record or select a video to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("categoryId", categoryId);
    formData.append("file", files[0]); 
    formData.append("latitude", 0);    
    formData.append("longitude", 0);
    formData.append("tags", tags.join(","));   

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
        
        setTimeout(() => {
          setIsUploading(false);
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("Upload error details:", err);
      setIsUploading(false);
      const backendError = err.response?.data?.message || "Something went wrong.";
      setErrorMessage(`Upload Failed: ${backendError}`);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFiles([
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [] }, 
    multiple: false
  });

  const removeFile = () => {
    setFiles([]);
  };

  // =========================================
  // INTEGRATED NATIVE IN-APP CAPTURE LOGIC
  // =========================================

  const startCamera = async () => {
    setErrorMessage("");
    setIsCameraActive(true);
    setRecordedChunks([]);

    // Strategy 1: Attempt to grab the back camera first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      setCameraStream(stream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (err) {
      // Strategy 2: If back camera is not found, fallback to ANY available camera (like your webcam)
      if (err.name === "NotFoundError" || err.name === "OverconstrainedError") {
        console.log("Rear camera not found, falling back to default webcam...");
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true, // Just get whatever camera is plugged in
            audio: true
          });

          setCameraStream(fallbackStream);
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = fallbackStream;
          }
        } catch (fallbackErr) {
          console.error("Complete camera failure:", fallbackErr);
          setErrorMessage("No functional camera device detected on this system.");
          setIsCameraActive(false);
        }
      } else {
        // Handle explicit user permission denials or blocks
        console.error("Camera access error:", err);
        setErrorMessage("Could not launch device viewfinder. Please check permissions or SSL config.");
        setIsCameraActive(false);
      }
    }
  };

  const startRecording = () => {
    if (!cameraStream) return;
    
    setRecordedChunks([]);
    
    const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? { mimeType: "video/webm;codecs=vp9" }
      : { mimeType: "video/webm" };

    const mediaRecorder = new MediaRecorder(cameraStream, options);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorder.start(10); // Capture data stream chunks every 10ms
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Delay processing slightly to guarantee the last async data blocks finish dropping into the buffer array
      setTimeout(() => {
        setRecordedChunks((chunks) => {
          if (chunks.length === 0) return chunks;
          
          const videoBlob = new Blob(chunks, { type: "video/mp4" });
          const generatedFile = new File([videoBlob], `cylo-recording-${Date.now()}.mp4`, {
            type: "video/mp4",
          });

          setFiles([
            Object.assign(generatedFile, {
              preview: URL.createObjectURL(generatedFile),
            })
          ]);
          
          // Power down hardware tracks clean
          closeCameraViewport(cameraStream);
          return [];
        });
      }, 100);
    }
  };

  const closeCameraViewport = (activeStream = cameraStream) => {
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
    }
    setCameraStream(null);
    setIsCameraActive(false);
    setIsRecording(false);
  };

  return (
    <div className="upload-layout">
      <Navigation />

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

      {/* =========================================
          TIKTOK-STYLE LIVE CAMERA VIEW OVERLAY
         ========================================= */}
      {isCameraActive && (
        <div className="camera-viewfinder-overlay">
          <div className="viewfinder-window">
            <video 
              ref={videoPreviewRef} 
              autoPlay 
              playsInline 
              muted 
              className="live-camera-feed"
            />
            
            <div className="viewfinder-header">
              <span className="live-badge">{isRecording ? "🔴 RECORDING" : "STANDBY"}</span>
              <button className="close-viewfinder-btn" onClick={() => closeCameraViewport()}>
                <X size={24} />
              </button>
            </div>

            <div className="viewfinder-controls">
              {!isRecording ? (
                <button className="record-trigger-btn start" onClick={startRecording}>
                  <Radio size={28} />
                  <span>Start Record</span>
                </button>
              ) : (
                <button className="record-trigger-btn stop" onClick={stopRecording}>
                  <Square size={28} />
                  <span>Stop & Save</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="upload-page">
        <div className="upload-container">
          <h2>Create Video Listing</h2>

          {errorMessage && (
            <div className="error-banner">
              <p>❌ {errorMessage}</p>
              <button onClick={() => setErrorMessage("")}>&times;</button>
            </div>
          )}

          <div className="upload-section">
            {files.length === 0 ? (
              <div className="upload-options">
                {/* OPTION 1: DRAG & DROP / BROWSE */}
                <div {...getRootProps()} className={`dropzone-mini ${isDragActive ? "active" : ""}`}>
                  <input {...getInputProps()} />
                  <UploadIcon size={32} />
                  <p>Upload Video</p>
                </div>

                {/* OPTION 2: LIVE CAMERA INTERACTION PORTAL */}
                <div className="camera-zone" onClick={startCamera}>
                   <Camera size={32} />
                   <p>Record Video</p>
                </div>
              </div>
            ) : (
              <div className="preview-container-single">
                <video src={files[0].preview} controls className="video-preview-main" />
                <button className="remove-btn-large" onClick={removeFile}><X size={20} /> Remove Video</button>
              </div>
            )}
          </div>

          <div className="form-content">
            <div className="inputs">
              <label>Title</label>
              <input type="text" value={title} onChange={(e)=> setTitle(e.target.value)} placeholder="e.g. iPhone 13 Pro - Great Condition" />
            </div>

            <div className="inputs">
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell buyers more about the item..." rows="4" />
            </div>

            <div className="price-qty-row">
                <div className="inputs">
                <label>Price (ZAR)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>

                <div className="inputs">
                <label>Quantity</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
            </div>

            {/* Tag Section */}
            <div className="inputs">
              <label>Tags (Press Enter to add)</label>
              <div className="tag-input-wrapper">
                <div className="tags-display">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag-chip">
                      #{tag} 
                      <X size={14} onClick={() => removeTag(tag)} />
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="e.g. sneakers, nike, fashion"
                />
              </div>
            </div>

            <div className="inputs">
              <label>Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="1">Electronics</option>
                <option value="2">Clothing</option>
                <option value="3">Home</option>
                <option value="4">Vehicles</option>
              </select>
            </div>

            <button 
              className="uploadBut" 
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Publish Listing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;