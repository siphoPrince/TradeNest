import React, { useState, useEffect, useRef } from "react";
import * as signalR from '@microsoft/signalr';
import { useSearchParams } from "react-router-dom"; 
import "../styles/Messege.css";

const Message = () => {
    const [searchParams] = useSearchParams();
    const [chats, setChats] = useState([]); 
    const [activeChat, setActiveChat] = useState(null); 
    const [messages, setMessages] = useState([]); 
    const [messageInput, setMessageInput] = useState("");
    const [connection, setConnection] = useState(null);

    const chatEndRef = useRef(null);
    const loggedInUserId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const urlUserId = searchParams.get("userId");
    const urlOrderId = searchParams.get("orderId");

    // 1. Establish SignalR Connection ONCE on mount
    useEffect(() => {
        if (!token) return;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7124/chatHub", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        newConnection.start()
            .then(() => {
                console.log("Connected to Cylo Chat 🚀");
                setConnection(newConnection);
            })
            .catch(err => console.error("SignalR Connection Error: ", err));

        return () => {
            if (newConnection) newConnection.stop();
        };
    }, []); // Empty dependency array keeps connection stable

    // 2. Manage Listeners (Update when activeChat changes to filter messages)
    useEffect(() => {
        if (!connection) return;

        // Clean up old listener before adding a new one
        connection.off("ReceiveMessage");

        connection.on("ReceiveMessage", (msg) => {
            setMessages((prev) => {
                // Ensure we only append if it belongs to the active conversation context
                const isRelevant = activeChat && String(msg.orderId) === String(activeChat.orderId);
                return isRelevant ? [...prev, msg] : prev;
            });
            fetchConversations(); 
        });
    }, [connection, activeChat?.orderId]);

    // 3. Data Fetching Logic
    const fetchConversations = async () => {
        try {
            const res = await fetch("https://localhost:7124/api/messages/conversations", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setChats(data);
            
            if (urlOrderId && !activeChat) {
                const autoSelect = data.find(c => String(c.orderId) === String(urlOrderId));
                if (autoSelect) {
                    setActiveChat(autoSelect);
                } else if (urlUserId) {
                    setActiveChat({ orderId: urlOrderId, userId: urlUserId, username: "New Inquiry" });
                }
            }
        } catch (e) { console.error("Sidebar load failed", e); }
    };

    useEffect(() => { fetchConversations(); }, [urlOrderId]);

    useEffect(() => {
        if (activeChat?.orderId) {
            const fetchHistory = async () => {
                const res = await fetch(`https://localhost:7124/api/messages/order/${activeChat.orderId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setMessages(data);
                
                // Mark as read
                fetch(`https://localhost:7124/api/messages/read/${activeChat.orderId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            };
            fetchHistory();
        }
    }, [activeChat?.orderId]);

    // 4. Send Message (Correct Argument Order for C# Hub)
    const sendMessage = async () => {
        if (connection && messageInput.trim() && activeChat) {
            try {
                // C# Hub: (int receiverId, string content, int? orderId)
                const targetUserId = parseInt(activeChat.userId || activeChat.otherUser?.userId || urlUserId);
                const orderId = activeChat.orderId ? parseInt(activeChat.orderId) : null;

                await connection.invoke(
                    "SendPrivateMessage", 
                    targetUserId, 
                    messageInput.trim(),
                    orderId
                );
                setMessageInput("");
            } catch (e) { console.error("Send failed", e); }
        }
    };

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    return (
        <div className="message-wrapper">
            <div className={`message-sidebar ${activeChat ? "hide-mobile" : ""}`}>
                <div className="sidebar-header"><h2>Orders Chat</h2></div>
                <div className="message-list">
                    {chats.map(chat => (
                        <div key={chat.orderId} 
                             className={`message-card ${activeChat?.orderId === chat.orderId ? "active" : ""}`} 
                             onClick={() => setActiveChat(chat)}>
                            <div className="chat-info">
                                <p className="username">{chat.otherUser?.handleName || `Order #${chat.orderId}`}</p>
                                <span className="last-message">{chat.lastMessage}</span>
                                {chat.unreadCount > 0 && <span className="unread-badge">{chat.unreadCount}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`message-display-container ${!activeChat ? "hide-mobile" : ""}`}>
                {activeChat ? (
                    <>
                        <div className="display-header">
                            <button className="back-btn" onClick={() => setActiveChat(null)}>←</button>
                            <h3>Order #{activeChat.orderId}</h3>
                        </div>
                        <div className="chat-content">
                            {messages.map((msg, i) => (
                                <div key={i} className={`message-bubble ${String(msg.senderId) === String(loggedInUserId) ? 'sent' : 'received'}`}>
                                    <p>{msg.content}</p>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="message-input-area">
                            <input value={messageInput} 
                                   onChange={(e) => setMessageInput(e.target.value)} 
                                   onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                                   placeholder="Type here..." />
                            <button onClick={sendMessage} disabled={!messageInput.trim()}>Send</button>
                        </div>
                    </>
                ) : <div className="no-chat-selected">Select a purchase to view messages</div>}
            </div>
        </div>
    );
};

export default Message;