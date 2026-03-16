import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, MessageCircle } from 'lucide-react';
import PaymentModal from "../components/PaymentModel"; 
import "../styles/BuyNow.css";

const BuyNow = () => {
    const { id } = useParams(); // 🎣 Grabs the ID from the URL (/buyNow/12)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the specific post details from your C# Backend
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

    if (loading) return <div className="loader">Loading item details... 📦</div>;
    if (!product) return <div>Product not found. ❌</div>;

    return (
        <div className="buy-page">
            <div className="buy-container">
                <Link to="/dashboard" className="back-link">← Back</Link>

                <div className="product-image">
                    {/* Use the dynamic image URL from your backend */}
                    <img src={`https://localhost:7124/uploads/${product.mediaUrl}`} alt={product.title} />
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
                postId={id} // 🔑 Pass the real ID to the modal for the Escrow!
            />
        </div>
    );
};

export default BuyNow;