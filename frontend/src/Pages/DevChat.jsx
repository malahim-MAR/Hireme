import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { apiRequest, getAuth } from "../api";

const DevChat = () => {
  const account = getAuth();
  const [activeChat, setActiveChat] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account?.id) return;
    apiRequest(`/chats?accountId=${account.id}&role=developer`)
      .then(setConversations)
      .catch((requestError) => setError(requestError.message));
  }, [account?.id]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!messageInput.trim()) return;

    try {
      const updatedChat = await apiRequest(`/chats/${conversations[activeChat].id}/messages`, {
        method: "POST",
        body: JSON.stringify({ accountId: account.id, role: "developer", text: messageInput }),
      });
      setConversations((current) => current.map((conversation, index) => index === activeChat ? updatedChat : conversation));
      setMessageInput("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const activeConversation = conversations[activeChat];

  return (
    <main className="chat-container">
      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <div>
              <h3>Companies</h3>
              <span>{conversations.length} reached out</span>
            </div>
            <Link to="/dev-dashboard" className="chat-back-link"><ArrowLeft size={15} /> Dashboard</Link>
          </div>
          <div className="chat-list">
            {conversations.map((conversation, index) => (
              <button
                type="button"
                key={conversation.id}
                className={`chat-list-item ${activeChat === index ? "active" : ""}`}
                onClick={() => setActiveChat(index)}
              >
                <div className="chat-list-avatar">{conversation.companyInitials}</div>
                <div className="chat-list-info">
                  <div className="chat-list-top">
                    <span className="chat-list-name">{conversation.companyName}</span>
                    <span className="chat-list-time">{conversation.time}</span>
                  </div>
                  <p className="chat-list-preview">{conversation.lastMessage}</p>
                  <span className="phase-pill">{conversation.phase}</span>
                </div>
                {conversation.unread > 0 && <span className="chat-unread-badge">{conversation.unread}</span>}
              </button>
            ))}
          </div>
        </aside>

        {activeConversation ? <section className="chat-main">
          <div className="chat-main-header">
            <div className="chat-main-avatar">{activeConversation.companyInitials}</div>
            <div>
              <h4>{activeConversation.companyName}</h4>
              <span className="chat-status">Current phase: {activeConversation.phase}</span>
            </div>
          </div>

          <div className="chat-messages">
            {activeConversation.messages.map((message, index) => (
              <div key={`${message.time}-${index}`} className={`chat-bubble ${message.from === "dev" ? "chat-bubble-sent" : "chat-bubble-received"}`}>
                <p>{message.text}</p>
                <span className="chat-bubble-time">{message.time}</span>
              </div>
            ))}
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Write a message..."
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              className="chat-input"
            />
            <button type="submit" className="chat-send-btn"><Send size={16} /> Send</button>
          </form>
        </section> : <section className="chat-main"><div className="empty-panel"><p>No conversations found in the database.</p></div></section>}
      </div>
      {error && <div className="error-banner">{error}</div>}
    </main>
  );
};

export default DevChat;
