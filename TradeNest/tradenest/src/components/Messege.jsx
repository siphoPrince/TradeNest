import "../styles/Messege.css";
import { useState, useEffect, useRef } from "react";
import * as signalR from '@microsoft/signalr';

const Message = ({ orderId }) => {
    const [activeChat, setActiveChat] = useState(null);
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const chatEndRef = useRef(null);

    // Get your ID from storage (1004)
    const loggedInUserId = localStorage.getItem("userId");

    // 1. Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 2. SignalR Lifecycle Management
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7124/chatHub", { 
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        const start = async () => {
            try {
                await newConnection.start();
                console.log("Connected to SignalR! 🚀");
                
                // Listen for messages from the Hub
                newConnection.on("ReceiveMessage", (message) => {
                    setMessages(prev => [...prev, message]);
                });

                setConnection(newConnection);
            } catch (err) {
                console.error("SignalR Connection Error: ", err);
            }
        };

        start();

        // CLEANUP: Prevents "The connection was stopped during negotiation"
        return () => {
            if (newConnection) {
                newConnection.off("ReceiveMessage");
                newConnection.stop();
            }
        };
    }, []);

    // 3. Send Message Logic (Types matched to C# Hub)
    const sendMessage = async () => {
        if (connection && messageInput.trim() !== "" && activeChat) {
            try {
                // FORCE TYPES: C# Hub expects 'int' and 'int?'
                const rId = parseInt(activeChat.id); 
                const oId = orderId ? parseInt(orderId) : null; 
                const content = messageInput.trim();

                // Invoke the C# Method
                await connection.invoke("SendPrivateMessage", rId, oId, content);
                
                // Clear the input on success
                setMessageInput(""); 
            } catch (e) {
                console.error("Sending failed: ", e);
            }
        }
    };

    // Mock data for the sidebar
    const chats = [
        { id: 1004, username: "Jessica", avatar: "https://i.pravatar.cc/150?img=5", lastMessage: "Hey...", time: "2m", online: true },
        { id: 2, username: "Michael", avatar: "https://i.pravatar.cc/150?img=8", lastMessage: "Project...", time: "1h", online: false }
    ];

    return (
        <div className="message-wrapper">
            {/* SIDEBAR */}
            <div className={`message-sidebar ${activeChat ? "hide-mobile" : ""}`}>
                <div className="sidebar-header"><h2>Messages</h2></div>
                <div className="message-list">
                    {chats.map(chat => (
                        <div key={chat.id} 
                             className={`message-card ${activeChat?.id === chat.id ? "active" : ""}`} 
                             onClick={() => setActiveChat(chat)}>
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
                {activeChat ? (
                    <>
                        <div className="display-header">
                            <button className="back-btn" onClick={() => setActiveChat(null)}>←</button>
                            <img src={activeChat.avatar} className="avatar small" alt="" />
                            <h3>{activeChat.username}</h3>
                        </div>

                        <div className="chat-content">
                            {messages.map((msg, index) => (
                                <div key={index} 
                                     className={`message-bubble ${String(msg.senderId) === String(loggedInUserId) ? 'sent' : 'received'}`}>
                                    <p>{msg.content}</p>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="message-input-area">
                            <input 
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                                placeholder="Type a message..." 
                            />
                            <button onClick={sendMessage} disabled={!messageInput.trim()}>Send</button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Select a conversation to start chatting on Cylo</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Message;