import { Search, House, Telescope, MessageCircle, Upload, UserPen } from "lucide-react";


const Navigation = () => {
    return(
        <>
        {/* SIDEBAR */}
        <nav className="sidebar">
            <h1 className="logo">CYLO</h1>
            <div className="search-bar">
                <Search size={18}/>
                <input type="text" placeholder="Search..." />
            </div>

            <div className="nav-links">
                <a href="/dashboard"><House /> Home</a>
                <a href="/profile"><UserPen /> Profile</a>
                <a href="/explore"><Telescope /> Explore</a>
                <a href="/upload"><Upload /> Upload</a>
                <a href="/inbox"><MessageCircle /> Inbox</a>
            </div>

        </nav>
      </>

    );
}

export default Navigation;