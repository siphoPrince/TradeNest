import "../styles/BuyNow.css";
import Hoddie from "../assets/hoddie.jpg"

import { Link } from "react-router-dom";
import { Heart, MessageCircle, Navigation  } from 'lucide-react';


const BuyNow = () => {
    return (
        <div className="buy-page">

            <div className="buy-container">

                <Link to="/dashboard" className="back-link">
                    ← Back to Product
                </Link>
                

                <div className="product-image">
                    <img src={Hoddie} alt="product" />
                </div>

                <div className="product-info">

                    <h2 className="product-name">iPhone 16</h2>

                    <span className="product-price">R205</span>

                    <div className="actions">

                        <div className="action-btn">
                            <Heart/>
                            <span>Like</span>
                        </div>

                        <div className="action-btn">
                            <MessageCircle />
                            <span>Comment</span>
                        </div>

                    </div>

                    <div className="seller-info">

                        <img src="/profile.jpg" className="seller-avatar" />

                        <div>
                            <p className="username">@user</p>
                            <small className="location">
                                Springs, Gauteng
                            </small>
                        </div>

                    </div>

                    <div className="description-product">
                        <p>
                            A slightly used iPhone in excellent condition.
                        </p>
                    </div>

                    <div className="details">

                        <div className="detail-pill">
                            Condition: New
                        </div>

                        <div className="detail-pill">
                            Category: Electronics
                        </div>

                        <div className="detail-pill">
                            Location: Springs, Gauteng
                        </div>

                    </div>

                    <button className="buy-btn">
                        Buy Now
                    </button>

                </div>

            </div>

        </div>
    );
};

export default BuyNow;