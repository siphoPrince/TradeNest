import "../styles/Messege.css";
import { useState } from "react";

const Message = () => {

    const [activeChat, setActiveChat] = useState(null);

    const chats = [
        {
            id: 1,
            username: "Jessica",
            avatar: "https://i.pravatar.cc/150?img=5",
            lastMessage: "Hey are you free later?",
            time: "2m",
            online: true
        },
        {
            id: 2,
            username: "Michael",
            avatar: "https://i.pravatar.cc/150?img=8",
            lastMessage: "That project looks good",
            time: "1h",
            online: false
        }
    ];

    return (
        <div className="message-wrapper">

            {/* SIDEBAR */}

            <div className={`message-sidebar ${activeChat ? "hide-mobile" : ""}`}>
                <div className="sidebar-header">
                    <h2>Messages</h2>
                </div>

                <div className="message-list">

                    {chats.map(chat => (

                        <div
                            key={chat.id}
                            className="message-card"
                            onClick={() => setActiveChat(chat)}
                        >

                            <div className="avatar-wrapper">

                                <img
                                    src={chat.avatar}
                                    alt={chat.username}
                                    className="avatar"
                                />

                                {chat.online && <span className="online-dot"></span>}

                            </div>

                            <div className="chat-info">

                                <div className="chat-top">
                                    <p className="username">{chat.username}</p>
                                    <span className="time">{chat.time}</span>
                                </div>

                                <span className="last-message">
                                    {chat.lastMessage}
                                </span>

                            </div>

                        </div>

                    ))}

                </div>
            </div>

            {/* CHAT DISPLAY */}

            <div className={`message-display-container ${!activeChat ? "hide-mobile" : ""}`}>

                {activeChat && (
                    <>
                        <div className="display-header">

                            <button
                                className="back-btn"
                                onClick={() => setActiveChat(null)}
                            >
                                ←
                            </button>

                            <img
                                src={activeChat.avatar}
                                className="avatar small"
                                alt=""
                            />

                            <h3>{activeChat.username}</h3>

                        </div>

                        <div className="chat-content">

                            <div className="message-bubble received">
                                <p>Hello 👋</p>
                            </div>

                            <div className="message-bubble sent">
                                <p>Hey what's up</p>
                            </div>

                        </div>

                        <div className="message-input-area">
                            <input placeholder="Send a message..." />
                        </div>
                    </>
                )}

            </div>

        </div>
    );
};

export default Message;