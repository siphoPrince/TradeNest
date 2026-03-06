import "../styles/Dashboard.css";
import { Search, House, Telescope, MessageCircle, Upload, UserPen } from "lucide-react";

function Dashboard() {
  return (
    <div className="container">

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

      {/* MAIN CONTENT */}
      <div className="feed">
        <h2>Video Feed</h2>
      </div>

    </div>
  );
}

export default Dashboard;