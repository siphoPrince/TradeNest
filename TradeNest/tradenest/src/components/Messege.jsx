import "../styles/Messege.css";
import { useState, useEffect } from "react";
import * as signalR from '@microsoft/signalr';

const Message = ({ orderId }) => { // receiverId will come from the selected activeChat
    const [activeChat, setActiveChat] = useState(null);
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState(""); // ✍️ Track what the user types

    useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7124/chatHub", { 
            accessTokenFactory: () => localStorage.getItem("token")
        })
        .withAutomaticReconnect()
        .build();

    const start = async () => {
        try {
            await newConnection.start();
            console.log("Connected to SignalR! 🚀");
            
            // Register the listener
            newConnection.on("ReceiveMessage", (message) => {
                setMessages(prev => [...prev, message]);
            });

            setConnection(newConnection);
        } catch (err) {
            console.error("Connection failed: ", err);
        }
    };

    start();

    return () => {
        if (newConnection) {
            newConnection.off("ReceiveMessage");
            newConnection.stop();
        }
    };
}, []);

    // 📤 Function to send message to the backend Hub
    const sendMessage = async () => {
        if (connection && messageInput.trim() !== "" && activeChat) {
            try {
                // Call the C# method: SendPrivateMessage(receiverId, orderId, content)
                await connection.invoke("SendPrivateMessage", activeChat.id, orderId, messageInput);
                
                // Clear the input after sending
                setMessageInput(""); 
            } catch (e) {
                console.error("Sending failed: ", e);
            }
        }
    };

    const chats = [
        { id: 1, username: "Jessica", avatar: "https://i.pravatar.cc/150?img=5", lastMessage: "Hey...", time: "2m", online: true },
        { id: 2, username: "Michael", avatar: "https://i.pravatar.cc/150?img=8", lastMessage: "Project...", time: "1h", online: false }
    ];

    return (
        <div className="message-wrapper">
            {/* SIDEBAR */}
            <div className={`message-sidebar ${activeChat ? "hide-mobile" : ""}`}>
                <div className="sidebar-header"><h2>Messages</h2></div>
                <div className="message-list">
                    {chats.map(chat => (
                        <div key={chat.id} className="message-card" onClick={() => setActiveChat(chat)}>
                            <div className="avatar-wrapper">
                                <img src={chat.avatar} alt={chat.username} className="avatar" />
                                {chat.online && <span className="online-dot"></span>}
                            </div>
                            <div className="chat-info">
                                <div className="chat-top">
                                    <p className="username">{chat.username}</p>
                                    <span className="time">{chat.time}</span>
                                </div>
                                <span className="last-message">{chat.lastMessage}</span>
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
                            <button className="back-btn" onClick={() => setActiveChat(null)}>←</button>
                            <img src={activeChat.avatar} className="avatar small" alt="" />
                            <h3>{activeChat.username}</h3>
                        </div>

                        <div className="chat-content">
                            {/* 🔄 Loop through our real messages state */}
                            {messages.map((msg, index) => (
                                <div key={index} className={`message-bubble ${msg.senderId === activeChat.id ? 'received' : 'sent'}`}>
                                    <p>{msg.content}</p>
                                </div>
                            ))}
                        </div>

                        <div className="message-input-area">
                            <input 
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()} // Send on Enter key
                                placeholder="Send a message..." 
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Message;