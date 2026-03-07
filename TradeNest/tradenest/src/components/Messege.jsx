import "../styles/Messege.css";

const Message = () => {
    return (
        <div className="message-wrapper">
            {/* Left Side: The List of Chats */}
            <div className="message-sidebar">
                <div className="sidebar-header">
                    <h2>Messages</h2>
                </div>
                <div className="message-list">
                    <div className="message-card active">
                        <p>User Name</p>
                        <span>This is a sample message...</span>
                    </div>
                    {/* More cards would go here */}
                </div>
            </div>

            {/* Right Side: The Conversation Display */}
            <div className="message-display-container">
                <div className="display-header">
                    <h3>User Name</h3>
                </div>
                <div className="chat-content">
                    <div className="message-bubble received">
                        <p>This is a sample message.</p>
                    </div>
                </div>
                <div className="message-input-area">
                    <input type="text" placeholder="Send a message..." />
                </div>
            </div>
        </div>
    );
};

export default Message;