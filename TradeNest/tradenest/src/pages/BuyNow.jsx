import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, MessageCircle, AlertCircle } from 'lucide-react';
import PaymentModal from "../components/PaymentModel"; 
import SellerSetup from "./SellerSetup";
import "../styles/BuyNow.css";

const BuyNow = () => {
    const { id } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSellerSetup, setShowSellerSetup] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`https://localhost:7124/api/Posts/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Helper to check if file is a video
    const isVideo = (url) => {
        return url?.match(/\.(mp4|webm|ogg|mov)$/i);
    };

    const handleSetupRequired = (message) => {
        setIsModalOpen(false); 
        setErrorMsg(message);
        setShowSellerSetup(true); 
    };

    if (loading) return <div className="loader">Loading item details... 📦</div>;
    if (!product) return <div>Product not found. ❌</div>;

    if (showSellerSetup) {
        return (
            <div className="buy-page">
                <div className="buy-container">
                    <button onClick={() => setShowSellerSetup(false)} className="back-link">← Cancel Setup</button>
                    <div className="setup-header">
                        <AlertCircle color="#facc15" size={48} />
                        <h2>Action Required</h2>
                        <p>{errorMsg}</p>
                    </div>
                    <SellerSetup onComplete={() => setShowSellerSetup(false)} />
                </div>
            </div>
        );
    }

    return (
        <div className="buy-page">
            <div className="buy-container">
                <Link to="/dashboard" className="back-link">← Back</Link>

                <div className="product-image">
                    {/* 🔥 FIXED: Video Snippet Logic Added Below */}
                    {isVideo(product.mediaUrl) ? (
                        <video 
                            src={`https://localhost:7124/uploads/${product.mediaUrl}`} 
                            className="buy-now-media"
                            controls // Better for the "Buy Now" page so users can scrub
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : (
                        <img 
                            src={`https://localhost:7124/uploads/${product.mediaUrl}`} 
                            alt={product.title} 
                            className="buy-now-media"
                        />
                    )}
                </div>

                <div className="product-info">
                    <h2 className="product-name">{product.title}</h2>
                    <span className="product-price">R{product.price}</span>

                    <div className="actions">
                        <div className="action-btn"><Heart/><span>Like</span></div>
                        <div className="action-btn"><MessageCircle /><span>Comment</span></div>
                    </div>

                    <button className="buy-btn" onClick={() => setIsModalOpen(true)}>
                        Buy Now
                    </button>
                </div>
            </div>

            <PaymentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                productName={product.title}
                productPrice={product.price}
                productId={id}
                
                sellerId={product.userId}
                onSetupRequired={handleSetupRequired} 
            />
        </div>
    );
};

export default BuyNow;