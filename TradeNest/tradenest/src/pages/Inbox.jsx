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

    const chatEndRef = useRef(null);
    const loggedInUserId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const urlUserId = searchParams.get("userId");
    const urlOrderId = searchParams.get("orderId");

    // Helper for Avatars
    const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || "?";

    useEffect(() => {
        if (!token) return;
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7124/chatHub", { accessTokenFactory: () => token })
            .withAutomaticReconnect()
            .build();

        newConnection.start()
            .then(() => setConnection(newConnection))
            .catch(err => console.error("SignalR Connection Error: ", err));

        return () => { if (newConnection) newConnection.stop(); };
    }, []);

    useEffect(() => {
        if (!connection) return;
        connection.off("ReceiveMessage");
        connection.off("MessageEdited");
        connection.off("MessageDeleted");

        connection.on("ReceiveMessage", (msg) => {
            setMessages((prev) => {
                const isRelevant = activeChat && String(msg.orderId) === String(activeChat.orderId);
                return isRelevant ? [...prev, msg] : prev;
            });
            fetchConversations(); 
        });

        connection.on("MessageEdited", ({ messageId, newContent }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent, isEdited: true } : m));
        });

        connection.on("MessageDeleted", (messageId) => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
        });
    }, [connection, activeChat?.orderId]);

    const fetchConversations = async () => {
        try {
            const res = await fetch("https://localhost:7124/api/messages/conversations", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setChats(data);
            
            if (urlOrderId && !activeChat) {
                const autoSelect = data.find(c => String(c.orderId) === String(urlOrderId));
                if (autoSelect) setActiveChat(autoSelect);
                else if (urlUserId) setActiveChat({ orderId: urlOrderId, userId: urlUserId, username: "New Inquiry" });
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
                fetch(`https://localhost:7124/api/messages/read/${activeChat.orderId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            };
            fetchHistory();
        }
    }, [activeChat?.orderId]);

    const sendMessage = async () => {
        if (connection && messageInput.trim() && activeChat) {
            try {
                const targetUserId = parseInt(activeChat.userId || activeChat.otherUser?.userId || urlUserId);
                const orderId = activeChat.orderId ? parseInt(activeChat.orderId) : null;
                await connection.invoke("SendPrivateMessage", targetUserId, messageInput.trim(), orderId);
                setMessageInput("");
            } catch (e) { console.error("Send failed", e); }
        }
    };

    const deleteMessage = async (msgId) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            await fetch(`https://localhost:7124/api/messages/${msgId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const targetUserId = parseInt(activeChat.userId || activeChat.otherUser?.userId);
            await connection.invoke("DeleteMessage", msgId, targetUserId);
            setMessages(prev => prev.filter(m => m.id !== msgId));
        } catch (e) { console.error("Delete failed", e); }
    };

    const saveEdit = async (msgId) => {
        if (!editValue.trim()) return;
        try {
            await fetch(`https://localhost:7124/api/messages/${msgId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(editValue)
            });
            const targetUserId = parseInt(activeChat.userId || activeChat.otherUser?.userId);
            await connection.invoke("EditMessage", msgId, targetUserId, editValue);
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: editValue, isEdited: true } : m));
            setEditingMsgId(null);
        } catch (e) { console.error("Edit failed", e); }
    };

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    return (
        <div className="message-wrapper">
            <div className={`message-sidebar ${activeChat ? "hide-mobile" : ""}`}>
                <div className="sidebar-header">
                    <h2>Messages</h2>
                </div>
                <div className="message-list">
                    {chats.map(chat => (
                        <div key={chat.orderId} 
                             className={`message-card ${activeChat?.orderId === chat.orderId ? "active" : ""}`} 
                             onClick={() => setActiveChat(chat)}>
                            <div className="avatar-wrapper">
                                <div className="avatar">{getInitials(chat.otherUser?.handleName)}</div>
                                <span className="online-dot"></span>
                            </div>
                            <div className="chat-info">
                                <div className="chat-info-top">
                                    <span className="username">{chat.otherUser?.handleName || `Order #${chat.orderId}`}</span>
                                    <span className="order-tag">#{chat.orderId}</span>
                                </div>
                                <p className="last-message">{chat.lastMessage}</p>
                            </div>
                            {chat.unreadCount > 0 && <span className="unread-badge">{chat.unreadCount}</span>}
                        </div>
                    ))}
                </div>
            </div>

            <div className={`message-display-container ${!activeChat ? "hide-mobile" : ""}`}>
                {activeChat ? (
                    <>
                        <div className="display-header">
                            <button className="back-btn" onClick={() => setActiveChat(null)}><ChevronLeft /></button>
                            <div className="avatar small">{getInitials(activeChat.otherUser?.handleName || "User")}</div>
                            <div className="header-text">
                                <h3>{activeChat.otherUser?.handleName || "Order Inquiry"}</h3>
                                <span className="status-text">Online</span>
                            </div>
                            <button className="icon-btn-more"><MoreVertical size={20}/></button>
                        </div>
                        
                        <div className="chat-content">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message-bubble ${String(msg.senderId) === String(loggedInUserId) ? 'sent' : 'received'}`}>
                                    {editingMsgId === msg.id ? (
                                        <div className="edit-mode-container">
                                            <input className="edit-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                                            <div className="edit-buttons">
                                                <button onClick={() => saveEdit(msg.id)}><Check size={14}/></button>
                                                <button onClick={() => setEditingMsgId(null)}><X size={14}/></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="message-text-wrapper">
                                            <p>{msg.content}</p>
                                            <div className="msg-footer">
                                                {msg.isEdited && <span className="edited-label">edited</span>}
                                            </div>
                                            {String(msg.senderId) === String(loggedInUserId) && (
                                                <div className="bubble-actions">
                                                    <button onClick={() => { setEditingMsgId(msg.id); setEditValue(msg.content); }}><Edit2 size={12}/></button>
                                                    <button onClick={() => deleteMessage(msg.id)}><Trash2 size={12}/></button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="message-input-area">
                            <input value={messageInput} 
                                   onChange={(e) => setMessageInput(e.target.value)} 
                                   onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                                   placeholder="Type a message..." />
                            <button className="send-btn" onClick={sendMessage} disabled={!messageInput.trim()}>
                                <Send size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="empty-state-icon">💬</div>
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Message;