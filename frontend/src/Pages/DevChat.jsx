import React, { useState } from "react";
import { Link } from "react-router-dom";

const DevChat = () => {
  const [activeChat, setActiveChat] = useState(0);
  const [messageInput, setMessageInput] = useState("");

  // Hardcoded conversations
  const [conversations, setConversations] = useState([
    {
      id: 0,
      companyName: "TechCorp Solutions",
      companyAvatar: "🏢",
      lastMessage: "We'd love to discuss the role further.",
      time: "2m ago",
      unread: 2,
      messages: [
        { from: "company", text: "Hi Sarthak! We saw your profile and are impressed.", time: "10:30 AM" },
        { from: "company", text: "We have a Full Stack position open. Interested?", time: "10:31 AM" },
        { from: "dev", text: "Hi! Thank you for reaching out. I'd love to learn more about the role.", time: "10:45 AM" },
        { from: "company", text: "Great! It's a React + Node.js stack. Remote friendly.", time: "10:50 AM" },
        { from: "company", text: "We'd love to discuss the role further.", time: "11:00 AM" },
      ],
    },
    {
      id: 1,
      companyName: "StartupXYZ",
      companyAvatar: "🚀",
      lastMessage: "When can you start?",
      time: "1h ago",
      unread: 0,
      messages: [
        { from: "company", text: "Hello! We're a YC-backed startup looking for a MERN dev.", time: "9:00 AM" },
        { from: "dev", text: "Sounds exciting! Tell me more about your team.", time: "9:15 AM" },
        { from: "company", text: "We're a team of 8, building a SaaS platform.", time: "9:20 AM" },
        { from: "company", text: "When can you start?", time: "9:25 AM" },
      ],
    },
    {
      id: 2,
      companyName: "DesignHub Agency",
      companyAvatar: "🎨",
      lastMessage: "We can offer ₹8 LPA for this role.",
      time: "3h ago",
      unread: 1,
      messages: [
        { from: "company", text: "Hi! Looking for a frontend developer with strong CSS skills.", time: "7:00 AM" },
        { from: "dev", text: "That's definitely my area of expertise!", time: "7:30 AM" },
        { from: "company", text: "We can offer ₹8 LPA for this role.", time: "8:00 AM" },
      ],
    },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const updated = [...conversations];
    updated[activeChat].messages.push({
      from: "dev",
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    updated[activeChat].lastMessage = messageInput;
    updated[activeChat].time = "Just now";
    setConversations(updated);
    setMessageInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-layout">
        {/* Sidebar: Conversations List */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h3>Messages</h3>
            <Link to="/dev-profile" className="chat-back-link">← Profile</Link>
          </div>
          <div className="chat-list">
            {conversations.map((conv, idx) => (
              <div
                key={conv.id}
                className={`chat-list-item ${activeChat === idx ? "active" : ""}`}
                onClick={() => setActiveChat(idx)}
              >
                <div className="chat-list-avatar">{conv.companyAvatar}</div>
                <div className="chat-list-info">
                  <div className="chat-list-top">
                    <span className="chat-list-name">{conv.companyName}</span>
                    <span className="chat-list-time">{conv.time}</span>
                  </div>
                  <p className="chat-list-preview">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && <span className="chat-unread-badge">{conv.unread}</span>}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          <div className="chat-main-header">
            <div className="chat-main-avatar">
              {conversations[activeChat].companyAvatar}
            </div>
            <div>
              <h4>{conversations[activeChat].companyName}</h4>
              <span className="chat-status">Online</span>
            </div>
          </div>

          <div className="chat-messages">
            {conversations[activeChat].messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.from === "dev" ? "chat-bubble-sent" : "chat-bubble-received"}`}>
                <p>{msg.text}</p>
                <span className="chat-bubble-time">{msg.time}</span>
              </div>
            ))}
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Write a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="chat-send-btn">Send</button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default DevChat;
