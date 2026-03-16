import { useState } from "react";
import "../styles/BuyNow.css";
import Hoddie from "../assets/hoddie.jpg";
import { Link } from "react-router-dom";
import { Heart, MessageCircle } from 'lucide-react';
// Import the new component
import PaymentModal from "../components/PaymentModel"; 

const BuyNow = () => {
    // 1. Control the visibility of the popup
    const [isModalOpen, setIsModalOpen] = useState(false);

    const productData = {
        name: "iPhone 16",
        price: 205
    };

    return (
        <div className="buy-page">
            <div className="buy-container">
                <Link to="/dashboard" className="back-link">← Back</Link>

                <div className="product-image">
                    <img src={Hoddie} alt="product" />
                </div>

                <div className="product-info">
                    <h2 className="product-name">{productData.name}</h2>
                    <span className="product-price">R{productData.price}</span>

                    <div className="actions">
                        <div className="action-btn"><Heart/><span>Like</span></div>
                        <div className="action-btn"><MessageCircle /><span>Comment</span></div>
                    </div>

                    {/* 2. Click to Open the Modal */}
                    <button className="buy-btn" onClick={() => setIsModalOpen(true)}>
                        Buy Now
                    </button>
                </div>
            </div>

            {/* 3. The Modal Component */}
            <PaymentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                productName={productData.name}
                productPrice={productData.price}
            />
        </div>
    );
};

export default BuyNow;