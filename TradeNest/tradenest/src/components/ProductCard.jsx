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

            <a href="#" className="buynow">
                Buy Now
            </a>

        </div>

    </div>
    );
}

export default ProductCard;