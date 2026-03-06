import { Link } from "react-router-dom";
import { Search, House, Telescope, MessageCircle, Upload, UserPen } from "lucide-react";

const Navigation = () => {
    return(
        <nav className="sidebar">

            <h1 className="logo">CYLO</h1>

            <div className="search-bar">
                <Search size={18}/>
                <input type="text" placeholder="Search..." />
            </div>

            <div className="nav-links">
                <Link to="/dashboard"><House /> Home</Link>
                <Link to="/profile"><UserPen /> Profile</Link>
                <Link to="/explore"><Telescope /> Explore</Link>
                <Link to="/upload"><Upload /> Upload</Link>
                <Link to="/inbox"><MessageCircle /> Inbox</Link>
            </div>

        </nav>
    );
}

export default Navigation;