import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    Search, 
    House, 
    Telescope, 
    MessageCircle, 
    Upload, 
    UserPen, 
    Utensils, 
    Bell // Imported for the activity notifications
} from "lucide-react";
import SearchBar from "./SearchBar";

const Navigation = () => {
    const loggedInUserId = localStorage.getItem("userId");
    
    // State to hold our badge count numbers
    const [counts, setCounts] = useState({
        notificationsCount: 0,
        messagesCount: 0
    });

    const fetchBadgeCounts = async () => {
        if (!loggedInUserId || loggedInUserId === "undefined") return;
        
        try {
            const response = await fetch(`https://localhost:7124/api/notifications/unread-counts/${loggedInUserId}`);
            if (response.ok) {
                const data = await response.json();
                setCounts(data);
            }
        } catch (error) {
            console.error("Error fetching badge counts:", error);
        }
    };

    useEffect(() => {
        // Run immediately on layout mount
        fetchBadgeCounts();

        // Check for updates automatically every 15 seconds to keep counts fresh
        const interval = setInterval(fetchBadgeCounts, 15000);
        return () => clearInterval(interval);
    }, [loggedInUserId]);

    return (
        <nav className="sidebar">

            <h1 className="logo">CYLO</h1>

            <SearchBar />

            <div className="nav-links">
                <Link to="/dashboard"><House /> Home</Link>
                <Link to="/profile"><UserPen /> Profile</Link>
                <Link to="/explore"><Telescope /> Explore</Link>
                <Link to="/upload"><Upload /> Upload</Link>
                
                {/* Inbox Link with Dynamic Message Badge */}
                <Link to="/inbox" className="nav-link-badge-container">
                    <div className="link-icon-wrapper">
                        <MessageCircle />
                        {counts.messagesCount > 0 && (
                            <span className="sidebar-badge">{counts.messagesCount}</span>
                        )}
                    </div>
                    Inbox
                </Link>

                {/* Activity Link with Dynamic Escrow Status Badge */}
                <Link to="/activity" className="nav-link-badge-container">
                    <div className="link-icon-wrapper">
                        <Bell />
                        {counts.notificationsCount > 0 && (
                            <span className="sidebar-badge">{counts.notificationsCount}</span>
                        )}
                    </div>
                    Activity
                </Link>

                <div className="nav-link-disabled">
                    <Utensils /> Foodies
                    <span className="coming-soon">Soon</span>
                </div>
            </div>

        </nav>
    );
}

export default Navigation;