import { Link } from "react-router-dom";
import BuyNow from "../pages/BuyNow";

const ProductCard = () =>{
    return(
        <div className="productInfo">

        <div className="profileInfo">
            <img src="/profile.jpg" className="profile-pic" />
            <span>@username</span>
        </div>

        <div className="description">
            <p>Clean streetwear hoodie — limited drop.</p>
        </div>

        <div className="product-actions">

            <div className="price">
                R450
            </div>

            <Link to="/BuyNow" className="buynow">BuyNow</Link>
            

        </div>

    </div>
    );
}

export default ProductCard;