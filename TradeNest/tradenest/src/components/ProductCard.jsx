import { Link } from "react-router-dom";

const ProductCard = ({ post }) => {
  // 1. Guard clause: Ensure we have post data before rendering 🛡️
  if (!post) return null;

  // 2. Base URL for your C# Media 🌐
  // This points to the wwwroot/uploads folder we set up earlier
  const backendBaseUrl = "https://localhost:7124/uploads/";
  const imageUrl = post.mediaUrl ? `${backendBaseUrl}${post.mediaUrl}` : "/placeholder-product.jpg";

  return (
    <div className="post-container"> 
      {/* 1. Main Media - This acts as the background for the text overlay */}
      <img 
        src={imageUrl} 
        alt={post.title} 
        className="feed-media"
        onError={(e) => { e.target.src = "/placeholder-product.jpg"; }}
      />

      {/* 2. Product Info Overlay - Matches .productInfo in your CSS */}
      <div className="productInfo">
        
        <div className="profileInfo">
          <img 
            src={post.userProfilePic || "/profile.jpg"} 
            className="profile-pic" 
            alt="User" 
          />
          <span>@User_{post.userId}</span>
        </div>

        <div className="description">
          <strong>{post.title}</strong>
          <p>{post.description}</p>
        </div>

        <div className="product-actions">
          <div className="price">
            R{post.price ? post.price.toLocaleString() : "0.00"}
          </div>
          
          <Link to={`/BuyNow/${post.id}`} className="buynow">
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;