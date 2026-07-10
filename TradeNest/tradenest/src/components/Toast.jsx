import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, Loader2, X } from "lucide-react";

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        // Automatically close the notification after 4 seconds
        const timer = setTimeout(() => {
            onClose();
        }, 4000); 
        
        return () => clearTimeout(timer);
    }, [onClose]);

    // Determine the color and icon based on the notification type
    const getStyles = () => {
        switch (type) {
            case "success": 
                return { bg: "#10b981", icon: <CheckCircle size={18} /> };
            case "error": 
                return { bg: "#ef4444", icon: <AlertCircle size={18} /> };
            default: 
                return { bg: "#3b82f6", icon: <Loader2 size={18} className="animate-spin" /> };
        }
    };

    const config = getStyles();

    return (
        <div style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 20px",
            borderRadius: "12px",
            backgroundColor: "#1e1e24", // Premium dark card surface color
            borderLeft: `5px solid ${config.bg}`,
            color: "#ffffff",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
            animation: "slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            maxWidth: "360px"
        }}>
            <span style={{ color: config.bg, display: "flex", flexShrink: 0 }}>
                {config.icon}
            </span>
            
            <p style={{ 
                margin: 0, 
                fontSize: "14px", 
                fontWeight: "500", 
                flex: 1, 
                lineHeight: "1.4" 
            }}>
                {message}
            </p>
            
            <button 
                onClick={onClose} 
                style={{ 
                    background: "none", 
                    border: "none", 
                    color: "#a0aec0", 
                    cursor: "pointer", 
                    padding: 0, 
                    display: "flex" 
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;