import { Link } from "react-router-dom";
import BuyNow from "../pages/BuyNow";

const ProductCard = ({post}) =>{
    if (!post) return null;
    return(
        <div className="productInfo">

        <div className="profileInfo">
            <img src="/profile.jpg" className="profile-pic" />
            <span>@User_{post.userId}</span>
        </div>

        <div className="description">
            <strong>{post.title}</strong>
            <p>{post.description}</p>
        </div>

        <div className="product-actions">

            <div className="price">
                R{post.price.toLocaleString()}
            </div>

            <Link to={`/BuyNow/${post.id}`} className="buynow">Buy Now</Link>
            

        </div>

    </div>
    );
}

export default ProductCard;