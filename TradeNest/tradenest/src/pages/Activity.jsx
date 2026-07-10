import React, { useState, useEffect, useCallback } from "react";
import Navigation from "../components/Navigation";
import { CheckCheck, ShoppingBag, AlertTriangle, CheckCircle, Info, ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/Activity.css";
// Clean global Axios configuration instance
import api from "../services/api";

const Activity = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Handle pagination purely client-side since the backend returns a flat top 50 array
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 10; 

    const loggedInUserId = localStorage.getItem("userId");

    // Fetch alerts safely with authorization headers automatically appended via Axios
    const fetchNotifications = useCallback(async () => {
        if (!loggedInUserId || loggedInUserId === "undefined" || loggedInUserId === "null") return;
        setLoading(true);
        try {
            // Secure Axios call passing the route userId
            const response = await api.get(`/api/notifications/${loggedInUserId}`);
            const result = response.data;
            
            // Normalize: If the backend returns a flat array directly, consume it. Otherwise, look for fallback wrapper.
            const rawList = Array.isArray(result) ? result : (result.data || []);
            setNotifications(rawList);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [loggedInUserId]);

    // Clears badge counts over your updated mark-all-read secure endpoint
    const markAsRead = useCallback(async () => {
        if (!loggedInUserId || loggedInUserId === "undefined" || loggedInUserId === "null") return;
        try {
            await api.post(`/api/notifications/mark-all-read/${loggedInUserId}?type=ACTIVITY`);
        } catch (error) {
            console.error("Failed to clear badges:", error);
        }
    }, [loggedInUserId]);

    // Execute standard page initialization loops
    useEffect(() => {
        const initializePage = async () => {
            await fetchNotifications();
            await markAsRead();
        };

        initializePage();
    }, [fetchNotifications, markAsRead]);

    // Client-side pagination logic math parameters
    const totalCount = notifications.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (pageNumber - 1) * pageSize;
    
    // Slice out exactly 10 cards to display on the current screen view
    const displayedNotifications = notifications.slice(startIndex, startIndex + pageSize);
    const hasNextPage = pageNumber < totalPages;

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPageNumber(newPage);
    };

    // Choose display icon matching the tracking key status
    const getIcon = (type) => {
        switch (type) {
            case "FUNDS_DEPOSITED": return <ShoppingBag className="icon-blue" />;
            case "CANCELED": return <AlertTriangle className="icon-red" />; 
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
                    ) : totalCount === 0 ? (
                        <div className="empty-state">
                            <CheckCheck size={48} />
                            <p>You're all caught up! No recent transaction activity.</p>
                        </div>
                    ) : (
                        <>
                            <div className="notifications-list">
                                 {displayedNotifications.map((notif) => (
                                    <div key={notif.id || notif.Id} className={`notification-card ${!(notif.isRead ?? notif.IsRead) ? "unread" : ""}`}>
                                        <div className="notif-icon-frame">
                                            {getIcon(notif.type || notif.Type)}
                                        </div>
                                        <div className="notif-content">
                                            <h4>{notif.title || notif.Title || "Untitled Notification"}</h4>
                                            <p>{notif.message || notif.Message || "No message content provided."}</p>
                                            <span className="notif-time">
                                                {new Date(notif.createdAt || notif.CreatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls Footer Component Block */}
                            <div className="pagination-footer">
                                <button 
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(pageNumber - 1)}
                                    disabled={pageNumber === 1}
                                >
                                    <ChevronLeft size={18} />
                                    <span>Previous</span>
                                </button>
                                
                                <span className="pagination-info">
                                    Page <strong>{pageNumber}</strong> of <strong>{totalPages}</strong>
                                </span>

                                <button 
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(pageNumber + 1)}
                                    disabled={!hasNextPage}
                                >
                                    <span>Next</span>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Activity;
