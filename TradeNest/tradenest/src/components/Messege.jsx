import "../styles/Messege.css";
import { useState, useEffect, useRef } from "react";
import * as signalR from '@microsoft/signalr';
import { useSearchParams } from "react-router-dom"; // Essential for catching the IDs

const Message = ({ orderId: propOrderId }) => {
    const [searchParams] = useSearchParams();
    const [chats, setChats] = useState([]); 
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState(""); // Added missing state
    const [connection, setConnection] = useState(null);
    
    const loggedInUserId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const chatEndRef = useRef(null);

    // Get IDs from the URL (/inbox?userId=1005&orderId=50)
    const urlUserId = searchParams.get("userId");
    const urlOrderId = searchParams.get("orderId") || propOrderId;

    // 1. Initialize SignalR Connection
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
                    setConnection(newConnection);
                    newConnection.on("ReceiveMessage", (msg) => {
                        setMessages(prev => {
                            // Only show message if it belongs to the person we are currently looking at
                            const isRelevant = activeChat && 
                                (String(msg.senderId) === String(activeChat.id) || 
                                 String(msg.receiverId) === String(activeChat.id));
                            return isRelevant ? [...prev, msg] : prev;
                        });
                        // Refresh sidebar to show the latest message
                        fetchConversations();
                    });
                }
            } catch (err) {
                console.error("SignalR Error:", err);
            }
        };

        start();
        return () => {
            isMounted = false;
            if (newConnection.state === signalR.HubConnectionState.Connected) {
                newConnection.stop();
            }
        };
    }, [activeChat?.id]); // Update listener scope when changing chats

    // 2. Load Conversations (Sidebar)
    const fetchConversations = async () => {
        try {
            const res = await fetch("https://localhost:7124/api/messages/conversations", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setChats(data);
        } catch (e) { console.error("Sidebar load failed", e); }
    };

    useEffect(() => { fetchConversations(); }, []);

    // 3. Logic to "Force Open" chat from URL if it's not in the sidebar
    useEffect(() => {
        const handleUrlUser = async () => {
            if (urlUserId) {
                // Is this person already in our sidebar?
                const existing = chats.find(c => String(c.userId) === String(urlUserId));
                if (existing) {
                    setActiveChat({ id: existing.userId, username: existing.username || `User ${existing.userId}` });
                } else {
                    // Start a fresh chat with someone new
                    setActiveChat({ id: urlUserId, username: "New Conversation" });
                    setMessages([]);
                }
            }
        };
        handleUrlUser();
    }, [urlUserId, chats.length]);

    // 4. Fetch history when activeChat changes
    useEffect(() => {
        if (activeChat?.id) {
            const fetchHistory = async () => {
                const res = await fetch(`https://localhost:7124/api/messages/${activeChat.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setMessages(data);
            };
            fetchHistory();
        }
    }, [activeChat?.id]);

    // 5. Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (connection && messageInput.trim() && activeChat) {
            try {
                await connection.invoke("SendPrivateMessage", 
                    parseInt(activeChat.id), 
                    urlOrderId ? parseInt(urlOrderId) : null, 
                    messageInput
                );
                setMessageInput("");
                // Force a sidebar refresh after sending first message
                fetchConversations();
            } catch (e) { console.error("Send failed", e); }
        }
    };

    return (
        <div className="message-wrapper">
            <div className="message-sidebar">
                <div className="sidebar-header"><h2>Messages</h2></div>
                <div className="message-list">
                    {chats.length > 0 ? chats.map(chat => (
                        <div key={chat.userId} 
                             className={`message-card ${String(activeChat?.id) === String(chat.userId) ? "active" : ""}`}
                             onClick={() => setActiveChat({id: chat.userId, username: chat.username || `User ${chat.userId}`})}>
                            <div className="chat-info">
                                <p className="username">{chat.username || `User ${chat.userId}`}</p>
                                <span className="last-message">{chat.lastMessage}</span>
                            </div>
                        </div>
                    )) : <p className="no-chats">No active conversations</p>}
                </div>
            </div>

            <div className="message-display-container">
                {activeChat ? (
                    <>
                        <div className="display-header">
                            <h3>{activeChat.username}</h3>
                        </div>
                        <div className="chat-content">
                            {messages.map((m, i) => (
                                <div key={i} className={`message-bubble ${String(m.senderId) === String(loggedInUserId) ? 'sent' : 'received'}`}>
                                    <p>{m.content}</p>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="message-input-area">
                            <input 
                                value={messageInput} 
                                onChange={e => setMessageInput(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Write a message..."
                            />
                            <button onClick={sendMessage} disabled={!messageInput.trim()}>Send</button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">Select a person to start chatting</div>
                )}
            </div>
        </div>
    );
};

export default Message;