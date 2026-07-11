import React, { useState, useEffect, useRef } from "react";
import * as signalR from '@microsoft/signalr';
import { useSearchParams } from "react-router-dom"; 
import { Edit2, Trash2, Check, X, Send, ChevronLeft, MoreVertical } from 'lucide-react';
import "../styles/Messege.css";

const Message = () => {
    const [searchParams] = useSearchParams();
    const [chats, setChats] = useState([]); 
    const [activeChat, setActiveChat] = useState(null); 
    const [messages, setMessages] = useState([]); 
    const [messageInput, setMessageInput] = useState("");
    const [connection, setConnection] = useState(null);
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [editValue, setEditValue] = useState("");

    // Missing state initializations needed by your typing and standalone status snippets
    const [isMeTyping, setIsMeTyping] = useState(false);
    const [partnerStatus, setPartnerStatus] = useState({ isOnline: false, lastSeen: null });

    const chatEndRef = useRef(null);
    const typingTimeoutRef = useRef(null); // Managed as a ref to prevent leakage during re-renders

    const loggedInUserId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const urlUserId = searchParams.get("userId");
    const urlOrderId = searchParams.get("orderId");

    const activeChatPartnerId = activeChat?.otherUser?.userId || urlUserId;
    const partnerName = activeChat?.otherUser?.handleName || "User";

    const getInitials = (name) => {
        if (!name) return "?";
        return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatMessageTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatLastSeen = (dateString) => {
        if (!dateString) return "Offline";
        const lastSeenDate = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - lastSeenDate) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return lastSeenDate.toLocaleDateString();
    };

    // Synchronize current partner status if active chat room updates natively
    useEffect(() => {
        if (activeChat?.otherUser) {
            setPartnerStatus({
                isOnline: activeChat.otherUser.isOnline || false,
                lastSeen: activeChat.otherUser.lastSeen || null
            });
        }
    }, [activeChat]);

    // 1. Setup SignalR Connection
    useEffect(() => {
        if (!token) return;
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://cylosocials.co.za/chatHub", { accessTokenFactory: () => token })
            .withAutomaticReconnect()
            .build();

        newConnection.start()
            .then(() => setConnection(newConnection))
            .catch(err => console.error("SignalR Connection Error: ", err));

        return () => { if (newConnection) newConnection.stop(); };
    }, [token]);

    // 2. Real-time Message Event Mapping
    useEffect(() => {
        if (!connection) return;

        connection.on("UpdateUserStatus", (userId, isOnline, lastSeenTime) => {
            if (String(activeChatPartnerId) === String(userId)) {
                setPartnerStatus({
                    isOnline: isOnline,
                    lastSeen: lastSeenTime ? new Date(lastSeenTime) : null
                });
            }
        });

        connection.on("ReceiveMessage", (msg) => {
            if (activeChat && String(msg.orderId) === String(activeChat.orderId)) {
                setMessages((prev) => [...prev, msg]);
            }
            fetchConversations(); 
        });

        connection.on("MessageEdited", ({ messageId, newContent }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent, isEdited: true } : m));
            setChats(prev => prev.map(c => c.orderId === activeChat?.orderId ? { ...c, lastMessage: newContent } : c));
        });

        connection.on("MessageDeleted", (messageId) => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
            fetchConversations(); 
        });

        connection.on("UserPresenceChanged", (userId, isOnline, lastSeen) => {
            setChats(prev => prev.map(chat => 
                String(chat.otherUser?.userId) === String(userId) 
                    ? { ...chat, otherUser: { ...chat.otherUser, isOnline, lastSeen } } 
                    : chat
            ));

            setActiveChat(prev => {
                if (prev && String(prev.otherUser?.userId) === String(userId)) {
                    return { ...prev, otherUser: { ...prev.otherUser, isOnline, lastSeen } };
                }
                return prev;
            });
        });

        return () => {
            connection.off("UpdateUserStatus");
            connection.off("ReceiveMessage");
            connection.off("MessageEdited");
            connection.off("MessageDeleted");
            connection.off("UserPresenceChanged");
        };
    }, [connection, activeChat, activeChatPartnerId]);

    // 3. Fetch Sidebar Threads
    const fetchConversations = async () => {
        try {
            const res = await fetch("https://cylosocials.co.za/api/messages/conversations", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setChats(data);
            
            if (urlOrderId && !activeChat) {
                const autoSelect = data.find(c => String(c.orderId) === String(urlOrderId));
                if (autoSelect) {
                    setActiveChat(autoSelect);
                } else if (urlUserId) {
                    const initRes = await fetch(`https://cylosocials.co.za/api/messages/initiate-order-chat/${urlOrderId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (initRes.ok) {
                        const newChatStub = await initRes.json();
                        setActiveChat(newChatStub);
                    }
                }
            }
        } catch (e) { console.error("Sidebar load failed", e); }
    };

    useEffect(() => { 
        fetchConversations(); 
    }, [urlOrderId]);

    // 4. Fetch Message History on active room changes
    useEffect(() => {
        if (activeChat?.orderId) {
            const fetchHistory = async () => {
                try {
                    const res = await fetch(`https://cylosocials.co.za/api/messages/order/${activeChat.orderId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    setMessages(Array.isArray(data) ? data : []);
                    
                    await fetch(`https://cylosocials.co.za/api/messages/read/${activeChat.orderId}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    setChats(prev => prev.map(c => c.orderId === activeChat.orderId ? { ...c, unreadCount: 0 } : c));
                } catch (err) {
                    console.error("Error retrieving history logs:", err);
                }
            };
            fetchHistory();
        }
    }, [activeChat?.orderId, token]);

    // Typing Status Mutation Handler
    const handleInputChange = (e) => {
        const value = e.target.value;
        setMessageInput(value);

        if (!connection || !activeChatPartnerId) return;

        if (!isMeTyping) {
            setIsMeTyping(true);
            connection.invoke("SendTypingStatus", parseInt(activeChatPartnerId), true)
                .catch(err => console.error(err));
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsMeTyping(false);
            connection.invoke("SendTypingStatus", parseInt(activeChatPartnerId), false)
                .catch(err => console.error(err));
        }, 2500);
    };

    // 5. Send Message Action Handler
    const sendMessage = async () => {
        if (connection && messageInput.trim() && activeChat) {
            try {
                const targetUserId = parseInt(activeChat.otherUser?.userId || urlUserId);
                const orderId = activeChat.orderId ? parseInt(activeChat.orderId) : null;
                
                // Explicitly clear typing timeout on submit
                clearTimeout(typingTimeoutRef.current);
                if (isMeTyping) {
                    setIsMeTyping(false);
                    await connection.invoke("SendTypingStatus", targetUserId, false);
                }

                await connection.invoke("SendPrivateMessage", targetUserId, messageInput.trim(), orderId);
                setMessageInput("");
            } catch (e) { console.error("Send failed", e); }
        }
    };

    const deleteMessage = async (msgId) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            await connection.invoke("DeleteMessage", msgId);
        } catch (e) { console.error("Delete socket transmission failed", e); }
    };

    const saveEdit = async (msgId) => {
        if (!editValue.trim()) return;
        try {
            await connection.invoke("EditMessage", msgId, editValue.trim());
            setEditingMsgId(null);
        } catch (e) { console.error("Edit socket transmission failed", e); }
    };

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    return (
        <div className="message-wrapper">
            {/* Sidebar */}
            <div className={`message-sidebar ${activeChat ? "hide-mobile" : ""}`}>
                <div className="sidebar-header">
                    <h2>Chats</h2>
                </div>
                
                {activeChat && (
                    <div className="chat-header-info">
                        <h4>{partnerName}</h4>
                        <div className="status-subtext">
                            {partnerStatus.isOnline ? (
                                <span className="status-online"><span className="dot"></span> Online</span>
                            ) : (
                                <span className="status-offline">
                                    Last seen {partnerStatus.lastSeen ? formatLastSeen(partnerStatus.lastSeen) : "recently"}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="message-list">
                    {chats.map(chat => (
                        <div key={chat.orderId} 
                             className={`message-card ${String(activeChat?.orderId) === String(chat.orderId) ? "active" : ""}`} 
                             onClick={() => setActiveChat(chat)}>
                            <div className="avatar-wrapper">
                                {chat.otherUser?.imageUrl ? (
                                    <img 
                                        src={chat.otherUser.imageUrl} 
                                        alt={chat.otherUser?.handleName} 
                                        className="avatar-img"
                                    />
                                ) : (
                                    <div className="avatar">{getInitials(chat.otherUser?.handleName)}</div>
                                )}
                                <span className={`online-dot ${chat.otherUser?.isOnline ? "online" : "offline"}`}></span>
                            </div>
                            <div className="chat-info">
                                <div className="chat-info-top">
                                    <span className="username">{chat.otherUser?.handleName || `Order #${chat.orderId}`}</span>
                                    <span className="timestamp">
                                        {chat.lastMessageTime ? formatMessageTime(chat.lastMessageTime) : ""}
                                    </span>
                                </div>
                                <div className="chat-info-bottom">
                                    <p className="last-message">{chat.lastMessage}</p>
                                    {chat.unreadCount > 0 && <span className="unread-badge">{chat.unreadCount}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Display */}
            <div className={`message-display-container ${!activeChat ? "hide-mobile" : ""}`}>
                {activeChat ? (
                    <>
                        <div className="display-header">
                            <button className="back-btn" onClick={() => setActiveChat(null)}><ChevronLeft /></button>
                            
                            <div className="avatar-wrapper-header">
                                {activeChat.otherUser?.imageUrl ? (
                                    <img 
                                        src={activeChat.otherUser.imageUrl} 
                                        alt={activeChat.otherUser?.handleName} 
                                        className="avatar-img small"
                                    />
                                ) : (
                                    <div className="avatar small">{getInitials(activeChat.otherUser?.handleName || "User")}</div>
                                )}
                            </div>

                            <div className="header-text">
                                <h3>{activeChat.otherUser?.handleName || `Order #${activeChat.orderId}`}</h3>
                                <div className="status-indicator">
                                    <span className={`status-dot ${partnerStatus.isOnline ? "online" : "offline"}`}></span>
                                    <span className="status-text">
                                        {partnerStatus.isOnline 
                                            ? "Online" 
                                            : `Last seen ${formatLastSeen(partnerStatus.lastSeen)}`}
                                    </span>
                                </div>
                            </div>
                            <button className="icon-btn-more"><MoreVertical size={20}/></button>
                        </div>
                        
                        <div className="chat-content">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message-bubble-row ${String(msg.senderId) === String(loggedInUserId) ? 'sent' : 'received'}`}>
                                    <div className="message-bubble">
                                        {editingMsgId === msg.id ? (
                                            <div className="edit-mode-container">
                                                <input className="edit-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                                                <div className="edit-buttons">
                                                    <button onClick={() => saveEdit(msg.id)}><Check size={16}/></button>
                                                    <button onClick={() => setEditingMsgId(null)}><X size={16}/></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p>{msg.content}</p>
                                                <div className="msg-footer">
                                                    {msg.isEdited && <span className="edited-label">edited</span>}
                                                    <span className="msg-time">{formatMessageTime(msg.sentAt)}</span>
                                                </div>
                                                {String(msg.senderId) === String(loggedInUserId) && (
                                                    <div className="bubble-actions">
                                                        <button onClick={() => { setEditingMsgId(msg.id); setEditValue(msg.content); }}><Edit2 size={12}/></button>
                                                        <button onClick={() => deleteMessage(msg.id)}><Trash2 size={12}/></button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="message-input-area">
                            <div className="input-pill">
                                <input value={messageInput} 
                                       onChange={handleInputChange} 
                                       onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                                       placeholder="Message..." />
                                <button className="send-btn" onClick={sendMessage} disabled={!messageInput.trim()}>
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="empty-state-card">
                            <div className="empty-state-icon">💬</div>
                            <h3>Your Messages</h3>
                            <p>Select a chat from the sidebar to view the conversation and order details.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Message;