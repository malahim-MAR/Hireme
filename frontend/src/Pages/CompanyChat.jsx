import React, { useState } from "react";
import { Link } from "react-router-dom";

const CompanyChat = () => {
  const [activeChat, setActiveChat] = useState(0);
  const [messageInput, setMessageInput] = useState("");

  // Hardcoded conversations with developers
  const [conversations, setConversations] = useState([
    {
      id: 0,
      devName: "Sarthak Thakur",
      devAvatar: "👨‍💻",
      devTitle: "Full Stack Developer",
      lastMessage: "I'd love to learn more about the role.",
      time: "2m ago",
      unread: 1,
      messages: [
        { from: "company", text: "Hi Sarthak! We saw your profile and are impressed.", time: "10:30 AM" },
        { from: "company", text: "We have a Full Stack position open. Interested?", time: "10:31 AM" },
        { from: "dev", text: "Hi! Thank you for reaching out. I'd love to learn more about the role.", time: "10:45 AM" },
      ],
    },
    {
      id: 1,
      devName: "Emily Chen",
      devAvatar: "👩‍💻",
      devTitle: "Frontend Developer",
      lastMessage: "Yes, I'm available for an interview next week.",
      time: "30m ago",
      unread: 0,
      messages: [
        { from: "company", text: "Hello Emily! We're looking for a React specialist.", time: "9:00 AM" },
        { from: "dev", text: "Sounds interesting! I have 4 years of React experience.", time: "9:10 AM" },
        { from: "company", text: "Great! Would you be open to a quick call this week?", time: "9:15 AM" },
        { from: "dev", text: "Yes, I'm available for an interview next week.", time: "9:20 AM" },
      ],
    },
    {
      id: 2,
      devName: "Arjun Patel",
      devAvatar: "🧑‍💻",
      devTitle: "Backend Developer",
      lastMessage: "I can start within a month.",
      time: "2h ago",
      unread: 0,
      messages: [
        { from: "company", text: "Hi Arjun, we need a senior backend engineer for our API team.", time: "7:00 AM" },
        { from: "dev", text: "That sounds like a great fit. What's the tech stack?", time: "7:30 AM" },
        { from: "company", text: "Python, Django, PostgreSQL with AWS infrastructure.", time: "7:35 AM" },
        { from: "dev", text: "I can start within a month.", time: "8:00 AM" },
      ],
    },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const updated = [...conversations];
    updated[activeChat].messages.push({
      from: "company",
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
            <h3>Candidates</h3>
            <Link to="/hire" className="chat-back-link">← Browse</Link>
          </div>
          <div className="chat-list">
            {conversations.map((conv, idx) => (
              <div
                key={conv.id}
                className={`chat-list-item ${activeChat === idx ? "active" : ""}`}
                onClick={() => setActiveChat(idx)}
              >
                <div className="chat-list-avatar">{conv.devAvatar}</div>
                <div className="chat-list-info">
                  <div className="chat-list-top">
                    <span className="chat-list-name">{conv.devName}</span>
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
              {conversations[activeChat].devAvatar}
            </div>
            <div>
              <h4>{conversations[activeChat].devName}</h4>
              <span className="chat-status">{conversations[activeChat].devTitle}</span>
            </div>
          </div>

          <div className="chat-messages">
            {conversations[activeChat].messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.from === "company" ? "chat-bubble-sent" : "chat-bubble-received"}`}>
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

export default CompanyChat;
