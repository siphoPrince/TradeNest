import React from "react";
import Messege from "../components/Messege"; 
import Navigation from "../components/Navigation";
import "../styles/Inbox.css"; // Ensure you have basic layout styling here

const Inbox = () => {
    return (
        <div className="inbox-page-container">
            {/* The side or bottom navigation bar */}
            <Navigation />

            <main className="inbox-main-content">
                {/* We pass orderId as a prop if this inbox was 
                  opened from a specific product 'Negotiate' button.
                  Otherwise, it defaults to null for general chat.
                */}
                <Messege orderId={null} />
            </main>
        </div>
    );
};

export default Inbox;