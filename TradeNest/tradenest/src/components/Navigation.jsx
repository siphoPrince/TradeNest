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
    Bell 
} from "lucide-react";
import SearchBar from "./SearchBar";
// Clean global Axios configuration instance
import api from "../services/api";

const Navigation = () => {
    const [counts, setCounts] = useState({
        notificationsCount: 0,
        messagesCount: 0
    });

    const fetchBadgeCounts = async () => {
        try {
            // Secure call: Targets your clean secure route, token handles user context!
            const response = await api.get("/api/notifications/unread-counts");
            
            const data = response.data;
            
            setCounts({
                notificationsCount: data.notificationsCount || 0,
                messagesCount: data.messagesCount || 0
            });

            // Let other mounted layout components know counts updated
            window.dispatchEvent(new CustomEvent("badgeCountsUpdated", { detail: data }));
            
        } catch (error) {
            console.error("Error fetching badge counts:", error);
        }
    };

    useEffect(() => {
        fetchBadgeCounts();

        // 15 seconds polling interval loop
        const interval = setInterval(fetchBadgeCounts, 15000);
        return () => clearInterval(interval);
    }, []);

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
