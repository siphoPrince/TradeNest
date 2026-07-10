import React, { useState, useCallback, useRef } from "react"; 
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { Camera, Upload as UploadIcon, X, Radio, Square } from "lucide-react"; 
import api from "../services/api"; // 1. CHANGED: Import your custom api wrapper instead of raw axios
import axios from "axios"; // Keep this ONLY for direct binary streaming to Cloudflare R2
import Navigation from "../components/Navigation";
import "../styles/Upload.css";

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 
  const videoPreviewRef = useRef(null); 
  const mediaRecorderRef = useRef(null); 
  
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

  // Live Recording States
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
    // Note: Token interceptor handles this automatically inside api.js, 
    // but keeping verification check alive to prevent unnecessary execution loops
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in first!");

    setErrorMessage(""); 
    
    if (files.length === 0) {
        setErrorMessage("Please record or select a video to upload.");
        return;
    }

    const videoFile = files[0];
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Opening high-speed upload channel... ⚡");

    try {
      const cleanFileName = `cylo-${Date.now()}-${videoFile.name?.replace(/[^a-zA-Z0-9.]/g, "") || "recorded.webm"}`;
      
      // STEP 1: Get presigned URL from backend using environment-aware 'api' instance
      const tokenResponse = await api.post("/api/uploads/presigned-url", { 
          filename: cleanFileName, 
          contentType: videoFile.type || "video/webm" 
      });

      const { uploadUrl, publicAssetUrl } = tokenResponse.data;

      // STEP 2: Stream raw bytes straight to Cloudflare R2
      // Note: We use raw axios here because uploadUrl is a complete external Cloudflare address
      setUploadStatus("Uploading directly to local edge network... 🚀");
      
      await axios.put(uploadUrl, videoFile, {
        headers: {
          "Content-Type": videoFile.type || "video/webm",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          setUploadStatus(`Streaming to Cylo CDN Edge... ${percentCompleted}%`);
        },
      });

      // STEP 3: Commit the metadata properties using environment-aware 'api' instance
      setUploadStatus("Publishing your listing live... ✨");
      
      const postMetadata = {
        title,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        directMediaUrl: publicAssetUrl, 
        latitude: 0,    
        longitude: 0,
        tags: tags.join(","),
      };

      const finalResponse = await api.post("/api/uploads/create-post", postMetadata);

      if (finalResponse.status === 200 || finalResponse.status === 201) {
        setUploadProgress(100);
        setUploadStatus("Listing Published Successfully! 🚀");
        
        setTimeout(() => {
          setIsUploading(false);
          navigate("/dashboard");
        }, 1200);
      }
    } catch (err) {
      console.error("Upload routing pipeline failure:", err);
      setIsUploading(false);
      const backendError = err.response?.data?.message || "Connection timeout. Please try again.";
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

  const startCamera = async () => {
    setErrorMessage("");
    setIsCameraActive(true);
    setRecordedChunks([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", 
          width: { ideal: 720 }, 
          height: { ideal: 1280 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      setCameraStream(stream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (err) {
      if (err.name === "NotFoundError" || err.name === "OverconstrainedError") {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          setCameraStream(fallbackStream);
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = fallbackStream;
          }
        } catch (fallbackErr) {
          setErrorMessage("No functional video capture devices found on this hardware.");
          setIsCameraActive(false);
        }
      } else {
        setErrorMessage("Camera initialization rejected. Please verify site privacy permissions.");
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

    mediaRecorder.start(10); 
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      setTimeout(() => {
        setRecordedChunks((chunks) => {
          if (chunks.length === 0) return chunks;
          
          const videoBlob = new Blob(chunks, { type: "video/webm" });
          const generatedFile = new File([videoBlob], `cylo-recording-${Date.now()}.webm`, {
            type: "video/webm",
          });

          setFiles([
            Object.assign(generatedFile, {
              preview: URL.createObjectURL(generatedFile),
            })
          ]);
          
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
            <p>{uploadProgress}% Complete</p>
          </div>
        </div>
      )}

      {isCameraActive && (
        <div className="camera-viewfinder-overlay">
          <div className="viewfinder-window">
            <video ref={videoPreviewRef} autoPlay playsInline muted className="live-camera-feed" />
            <div className="viewfinder-header">
              <span className="live-badge">{isRecording ? "🔴 RECORDING" : "READY"}</span>
              <button className="close-viewfinder-btn" onClick={() => closeCameraViewport()}>
                <X size={24} />
              </button>
            </div>
            <div className="viewfinder-controls">
              {!isRecording ? (
                <button className="record-trigger-btn start" onClick={startRecording}>
                  <Radio size={28} />
                  <span>Record</span>
                </button>
              ) : (
                <button className="record-trigger-btn stop" onClick={stopRecording}>
                  <Square size={28} />
                  <span>Stop & Keep</span>
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
                <div {...getRootProps()} className={`dropzone-mini ${isDragActive ? "active" : ""}`}>
                  <input {...getInputProps()} />
                  <UploadIcon size={32} />
                  <p>Upload Video</p>
                </div>
                <div className="camera-zone" onClick={startCamera}>
                   <Camera size={32} />
                   <p>Record Live</p>
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
              <input type="text" value={title} onChange={(e)=> setTitle(e.target.value)} placeholder="e.g. Vintage Leather Jacket" />
            </div>

            <div className="inputs">
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your product conditions or features..." rows="4" />
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

            <div className="inputs">
              <label>Tags (Press Enter to separate)</label>
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
                  placeholder="e.g. thrift, streetwear"
                />
              </div>
            </div>

            <div className="inputs">
              <label>Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="1">Electronics</option>
                <option value="2">Clothing</option>
                <option value="3">Home</option>
              </select>
            </div>

            <button className="uploadBut" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Processing..." : "Publish Listing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;