import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { CheckCheck, ShoppingBag, AlertTriangle, CheckCircle, Info } from "lucide-react";
import "../styles/Activity.css";

const Activity = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const loggedInUserId = localStorage.getItem("userId");

    // Fetch the detailed list of alerts
    const fetchNotifications = async () => {
        if (!loggedInUserId) return;
        try {
            const response = await fetch(`https://localhost:7124/api/notifications/${loggedInUserId}`);
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    };

    // Clears badge counts via the database
    const markAsRead = async () => {
        if (!loggedInUserId) return;
        try {
            await fetch(`https://localhost:7124/api/notifications/mark-all-read/${loggedInUserId}?type=ACTIVITY`, {
                method: "POST"
            });
        } catch (error) {
            console.error("Failed to clear badges", error);
        }
    };

    useEffect(() => {
        const initializePage = async () => {
            // 1. Fetch data first so the unread items render with their glowing borders
            await fetchNotifications();
            
            // 2. Clear the sidebar metrics counters silently in the background
            await markAsRead();
        };

        initializePage();
    }, [loggedInUserId]);

    // Choose icon based on transaction status
    const getIcon = (type) => {
        switch (type) {
            case "FUNDS_DEPOSITED": return <ShoppingBag className="icon-blue" />;
            case "CANCELED": return <AlertTriangle className="icon-red" />; // Matches normalized state
            case "COMPLETED": return <CheckCircle className="icon-green" />;
            default: return <Info className="icon-gray" />;
        }
    };

    return (
        <div className="activity-layout">
            <Navigation />
            <div className="activity-page">
                <div className="activity-container">
                    <div className="activity-header">
                        <h2>Activity Tracker</h2>
                        <p>Track your escrow status updates and order notifications.</p>
                    </div>

                    {loading ? (
                        <div className="loading-state">Loading updates... ⏳</div>
                    ) : notifications.length === 0 ? (
                        <div className="empty-state">
                            <CheckCheck size={48} />
                            <p>You're all caught up! No recent transaction activity.</p>
                        </div>
                    ) : (
                        <div className="notifications-list">
                            {notifications.map((notif) => (
                                <div key={notif.id} className={`notification-card ${!notif.isRead ? "unread" : ""}`}>
                                    <div className="notif-icon-frame">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="notif-content">
                                        <h4>{notif.title}</h4>
                                        <p>{notif.message}</p>
                                        <span className="notif-time">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Activity;