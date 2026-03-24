import React, { useState, useEffect, useRef } from "react";
import * as signalR from '@microsoft/signalr';
import "../styles/Messege.css";

const Message = ({ orderId }) => {
    // --- State Management ---
    const [chats, setChats] = useState([]); // Sidebar conversations
    const [activeChat, setActiveChat] = useState(null); // Selected user
    const [messages, setMessages] = useState([]); // Current conversation history
    const [messageInput, setMessageInput] = useState("");
    const [connection, setConnection] = useState(null);

    const chatEndRef = useRef(null);
    const loggedInUserId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    // --- 1. SignalR Connection Lifecycle ---
    useEffect(() => {
        if (!token) return;

        let isMounted = true;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7124/chatHub", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        const start = async () => {
            try {
                await newConnection.start();
                if (isMounted) {
                    console.log("Connected to Cylo Chat 🚀");
                    setConnection(newConnection);

                    // Listen for incoming messages
                    newConnection.on("ReceiveMessage", (msg) => {
                        // Logic: We only append to the UI if the message belongs to the current open chat
                        // or if we were the sender (for multi-tab sync)
                        setMessages((prev) => {
                            const isRelevant = 
                                (msg.senderId === activeChat?.id || msg.receiverId === activeChat?.id);
                            
                            // Optimization: If it's a new person messaging us, refresh the sidebar
                            if (!isRelevant) fetchConversations(); 

                            return isRelevant ? [...prev, msg] : prev;
                        });
                    });
                }
            } catch (err) {
                console.error("SignalR Connection Error: ", err);
                if (isMounted) setTimeout(start, 5000); // Retry
            }
        };

        start();

        return () => {
            isMounted = false;
            if (newConnection.state === signalR.HubConnectionState.Connected) {
                newConnection.stop();
            }
        };
    }, [activeChat?.id]); // Re-bind listener context when activeChat changes

    // --- 2. Data Fetching ---

    // Fetch the list of people you've messaged (Sidebar)
    const fetchConversations = async () => {
        try {
            const res = await fetch("https://localhost:7124/api/messages/conversations", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setChats(data);
        } catch (e) { console.error("Could not load conversations", e); }
    };

    // Fetch history when a user is selected
    const fetchHistory = async (otherUserId) => {
        try {
            const res = await fetch(`https://localhost:7124/api/messages/${otherUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setMessages(data);
        } catch (e) { console.error("Could not load history", e); }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeChat) {
            fetchHistory(activeChat.id);
        }
    }, [activeChat]);

    // --- 3. Actions ---

    const sendMessage = async () => {
        if (connection && messageInput.trim() && activeChat) {
            try {
                // Matches C# Hub: SendPrivateMessage(int receiverId, int? orderId, string content)
                await connection.invoke(
                    "SendPrivateMessage", 
                    parseInt(activeChat.id), 
                    orderId ? parseInt(orderId) : null, 
                    messageInput.trim()
                );
                setMessageInput("");
            } catch (e) {
                console.error("Send failed: ", e);
            }
        }
    };

    // Auto-scroll logic
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="message-wrapper">
            {/* SIDEBAR */}
            <div className={`message-sidebar ${activeChat ? "hide-mobile" : ""}`}>
                <div className="sidebar-header"><h2>Messages</h2></div>
                <div className="message-list">
                    {chats.length > 0 ? chats.map(chat => (
                        <div 
                            key={chat.userId} 
                            className={`message-card ${activeChat?.id === chat.userId ? "active" : ""}`} 
                            onClick={() => setActiveChat({id: chat.userId, username: chat.username || `User ${chat.userId}`})}
                        >
                            <div className="chat-info">
                                <p className="username">{chat.username || `User ${chat.userId}`}</p>
                                <span className="last-message">{chat.lastMessage}</span>
                            </div>
                        </div>
                    )) : <p className="no-chats">No conversations yet</p>}
                </div>
            </div>

            {/* CHAT DISPLAY */}
            <div className={`message-display-container ${!activeChat ? "hide-mobile" : ""}`}>
                {activeChat ? (
                    <>
                        <div className="display-header">
                            <button className="back-btn" onClick={() => setActiveChat(null)}>←</button>
                            <h3>{activeChat.username}</h3>
                        </div>

                        <div className="chat-content">
                            {messages.map((msg, index) => (
                                <div key={index} 
                                     className={`message-bubble ${String(msg.senderId) === String(loggedInUserId) ? 'sent' : 'received'}`}>
                                    <p>{msg.content}</p>
                                    <span className="msg-time">{new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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