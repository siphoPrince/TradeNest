import Navigation from "../components/Navigation";
import "../styles/Explore.css";

const Explore = () => {
    return(
        <div className="explore-page">
            <Navigation />

            <div className="Explore-container">

                <div className="header">
                    <h2>Explore</h2>
                </div>

                {/* Category Navigation */}

                 <div className="category-nav">
                    <div className="allNav"><button className="cat-btn active">All</button></div>
                    <div className="Electronics"><button className="cat-btn">Electronics</button></div>
                    <div className="FashionNav"><button className="cat-btn">Fashion</button></div>
                    <div className="HomeNav"><button className="cat-btn">Home</button></div>
                    <div className="Sports"><button className="cat-btn">Sports</button></div>
                    <div className="BeautyNav"><button className="cat-btn">Beauty</button></div>
                </div>

                {/* Listings Grid */}

                <div className="listings-grid">

                    <div className="listing-card">
                        <img src="https://picsum.photos/200" alt="listing" className="listing-img"/>
                        <div className="listing-info">
                            <span className="listing-title">Vintage Camera</span>
                            <span className="listing-price">R150</span>
                        </div>
                    </div>

                    <div className="listing-card">
                        <img src="https://picsum.photos/200" alt="listing" className="listing-img"/>
                        <div className="listing-info">
                            <span className="listing-title">Nike Sneakers</span>
                            <span className="listing-price"><Ri:viewport></Ri:viewport>80</span>
                        </div>
                    </div>

                    <div className="listing-card">
                        <img src="https://picsum.photos/200" alt="listing" className="listing-img"/>
                        <div className="listing-info">
                            <span className="listing-title">Gaming Keyboard</span>
                            <span className="listing-price">R60</span>
                        </div>
                    </div>
                    <div className="listing-card">
                        <img src="https://picsum.photos/200" alt="listing" className="listing-img"/>
                        <div className="listing-info">
                            <span className="listing-title">Gaming Keyboard</span>
                            <span className="listing-price">R60</span>
                        </div>
                    </div>
                    <div className="listing-card">
                        <img src="https://picsum.photos/200" alt="listing" className="listing-img"/>
                        <div className="listing-info">
                            <span className="listing-title">Gaming Keyboard</span>
                            <span className="listing-price">R60</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default Explore;