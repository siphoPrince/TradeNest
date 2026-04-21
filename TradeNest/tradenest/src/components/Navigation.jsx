import { Link } from "react-router-dom";
import { Search, House, Telescope, MessageCircle, Upload, UserPen, Utensils } from "lucide-react";
import SearchBar from "./SearchBar";

const Navigation = () => {
    return(
        <nav className="sidebar">

            <h1 className="logo">CYLO</h1>

            <SearchBar />

            <div className="nav-links">
                <Link to="/dashboard"><House /> Home</Link>
                <Link to="/profile"><UserPen /> Profile</Link>
                <Link to="/explore"><Telescope /> Explore</Link>
                <Link to="/upload"><Upload /> Upload</Link>
                <Link to="/inbox"><MessageCircle /> Inbox</Link>

                <div className="nav-link-disabled">
                    <Utensils /> Foodies
                    <span className="coming-soon">Soon</span>
                </div>
            </div>

        </nav>
    );
}

export default Navigation;