import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, AlertCircle, MapPin, User, ChevronLeft, X } from 'lucide-react';
import PaymentModal from "../components/PaymentModel"; 
import SellerSetup from "./SellerSetup";
import "../styles/BuyNow.css";

const BuyNow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('userId');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSellerSetup, setShowSellerSetup] = useState(false);
    
    // UI Notification Feedbacks 
    const [errorMsg, setErrorMsg] = useState("");
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
    };

    // Auto-dismiss Toast handler
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4500);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`https://cylosocials.co.za/api/Posts/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                } else {
                    showToast("Could not retrieve item details from listing servers.", "error");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                showToast("Network fault encountered mapping parameters.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const isVideo = (url) => {
        return url?.match(/\.(mp4|webm|ogg|mov)$/i);
    };

    // New Helper: Safely parses absolute cloud URIs vs local storage links
    const getMediaSrc = (url) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url; // Return Cloudflare R2 URL directly
        }
        return `https://cylosocials.co.za/uploads/${url}`; // Fallback to local server environment
    };

    const handleSetupRequired = (message) => {
        setIsModalOpen(false); 
        setErrorMsg(message);
        setShowSellerSetup(true); 
    };

    const handleCheckoutVerification = () => {
        // Guard checking if the active user owns the listing
        if (currentUserId && String(product?.userId) === String(currentUserId)) {
            showToast("Transaction restricted: You cannot buy your own marketplace listing.", "warning");
            return;
        }
        setIsModalOpen(true);
    };

    if (loading) return <div className="loader">Loading item details... 📦</div>;
    if (!product) return <div className="error-fallback-view">Product listing not found or has been removed. ❌</div>;

    if (showSellerSetup) {
        return (
            <div className="buy-page">
                <div className="buy-container single-column-layout">
                    <button onClick={() => setShowSellerSetup(false)} className="back-link btn-raw-clear">
                        <ChevronLeft size={16} /> Cancel Setup Framework
                    </button>
                    <div className="setup-header">
                        <AlertCircle color="#facc15" size={48} />
                        <h2>Payout Integration Required</h2>
                        <p>{errorMsg}</p>
                    </div>
                    <SellerSetup onComplete={() => setShowSellerSetup(false)} />
                </div>
            </div>
        );
    }

    return (
        <div className="buy-page">
            {/* Inline Micro-Notification Alert Toast banner */}
            {toast.show && (
                <div className={`modern-app-toast global-toast-${toast.type}`}>
                    <span>{toast.message}</span>
                    <button className="toast-dismiss-btn" onClick={() => setToast(prev => ({ ...prev, show: false }))}>
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="buy-container">
                <Link to="/dashboard" className="back-link">
                    <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Back to Listings
                </Link>

                <div className="product-image">
                    {isVideo(product.mediaUrl) ? (
                        <video 
                            src={getMediaSrc(product.mediaUrl)} 
                            className="buy-now-media"
                            controls 
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : (
                        <img 
                            src={getMediaSrc(product.mediaUrl)} 
                            alt={product.title} 
                            className="buy-now-media"
                        />
                    )}
                </div>

                <div className="product-info">
                    <div>
                        <h2 className="product-name">{product.title}</h2>
                        <span className="product-price">R{product.price}</span>
                    </div>

                    <div className="seller-info">
                        {product.sellerAvatar ? (
                            <img src={product.sellerAvatar} alt="Seller" className="seller-avatar" />
                        ) : (
                            <div className="seller-avatar fallback-avatar-icon">
                                <User size={20} />
                            </div>
                        )}
                        <div>
                            <div className="username">{product.username || "Verified Cylo Merchant"}</div>
                            {product.location && (
                                <div className="location">
                                    <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    {product.location}
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="divider-line" />

                    {product.description && (
                        <p className="description-product">
                            {product.description}
                        </p>
                    )}

                    {/* Meta tags pills block mapping incoming parameters dynamically */}
                    <div className="details">
                        {product.category && <span className="detail-pill">🏷️ {product.category}</span>}
                        {product.condition && <span className="detail-pill">✨ Condition: {product.condition}</span>}
                        <span className="detail-pill">🔒 Safe Escrow Protected</span>
                    </div>

                    <div className="actions">
                        <div className="action-btn"><Heart size={18} /><span>Like</span></div>
                        <div className="action-btn"><MessageCircle size={18} /><span>Comment</span></div>
                    </div>

                    <button className="buy-btn" onClick={handleCheckoutVerification}>
                        Proceed to Secure Checkout
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