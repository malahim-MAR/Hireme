import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { apiRequest, getAuth } from "../api";

const phaseOptions = ["Intro", "Screening", "Technical Interview", "Final Interview", "Offer", "Negotiation", "Hired", "Rejected"];

const formatChatTime = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
};

const CompanyChat = () => {
  const account = getAuth();
  const [activeChat, setActiveChat] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account?.id) return;
    apiRequest("/chats")
      .then(setConversations)
      .catch((requestError) => setError(requestError.message));
  }, [account?.id]);

  useEffect(() => {
    if (activeChat >= conversations.length) setActiveChat(0);
  }, [activeChat, conversations.length]);

  const pipelineStages = useMemo(() => [...new Set([...phaseOptions, ...conversations.map((conversation) => conversation.phase).filter(Boolean)])], [conversations]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!messageInput.trim() || !conversations[activeChat]) return;

    try {
      const updatedChat = await apiRequest(`/chats/${conversations[activeChat].id}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: messageInput }),
      });
      setConversations((current) => current.map((conversation, index) => index === activeChat ? updatedChat : conversation));
      setMessageInput("");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updatePhase = async (event) => {
    try {
      const updatedChat = await apiRequest(`/chats/${conversations[activeChat].id}/phase`, {
        method: "PATCH",
        body: JSON.stringify({ phase: event.target.value }),
      });
      setConversations((current) => current.map((conversation, index) => index === activeChat ? updatedChat : conversation));
      setError("");
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
              <h3>Candidates</h3>
              <span>{conversations.length} active conversations</span>
            </div>
            <Link to="/hire" className="chat-back-link"><ArrowLeft size={15} /> Browse</Link>
          </div>
          <div className="chat-list">
            {conversations.map((conversation, index) => (
              <button
                type="button"
                key={conversation.id}
                className={`chat-list-item ${activeChat === index ? "active" : ""}`}
                onClick={() => setActiveChat(index)}
              >
                <div className="chat-list-avatar">{conversation.devInitials}</div>
                <div className="chat-list-info">
                  <div className="chat-list-top">
                    <span className="chat-list-name">{conversation.devName}</span>
                    <span className="chat-list-time">{formatChatTime(conversation.time)}</span>
                  </div>
                  <p className="chat-list-preview">{conversation.lastMessage}</p>
                  <span className="phase-label">{conversation.phase}</span>
                </div>
                {conversation.unread > 0 && <span className="chat-unread-badge">{conversation.unread}</span>}
              </button>
            ))}
          </div>
        </aside>

        {activeConversation ? <section className="chat-main">
          <div className="chat-main-header">
            <div className="chat-main-avatar">{activeConversation.devInitials}</div>
            <div>
              <h4>{activeConversation.devName}</h4>
                <span className="chat-status">{activeConversation.devTitle || "Developer"}</span>
            </div>
            <label className="phase-select">
              <span className="phase-select-label">Phase</span>
              <select value={activeConversation.phase} onChange={updatePhase}>
                {pipelineStages.map((stage) => <option key={stage}>{stage}</option>)}
              </select>
            </label>
          </div>

          <div className="chat-messages">
            {activeConversation.messages.map((message, index) => (
              <div key={`${message.time}-${index}`} className={`chat-bubble ${message.from === "company" ? "chat-bubble-sent company" : "chat-bubble-received"}`}>
                <p>{message.text}</p>
                <span className="chat-bubble-time">{formatChatTime(message.time)}</span>
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
            <button type="submit" className="chat-send-btn company" disabled={!messageInput.trim()}><Send size={16} /> Send</button>
          </form>
        </section> : <section className="chat-main chat-empty-state"><div className="empty-panel"><p>No conversations yet. Contact a developer from the browse page to start one.</p></div></section>}
      </div>
      {error && <div className="error-banner">{error}</div>}
    </main>
  );
};

export default CompanyChat;
