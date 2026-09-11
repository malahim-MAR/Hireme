import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { apiRequest, getAuth } from "../api";

const CompanyChat = () => {
  const account = getAuth();
  const [activeChat, setActiveChat] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account?.id) return;
    apiRequest(`/chats?accountId=${account.id}&role=company`)
      .then(setConversations)
      .catch((requestError) => setError(requestError.message));
  }, [account?.id]);

  const pipelineStages = useMemo(() => [...new Set(conversations.map((conversation) => conversation.phase).filter(Boolean))], [conversations]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!messageInput.trim()) return;

    try {
      const updatedChat = await apiRequest(`/chats/${conversations[activeChat].id}/messages`, {
        method: "POST",
        body: JSON.stringify({ accountId: account.id, role: "company", text: messageInput }),
      });
      setConversations((current) => current.map((conversation, index) => index === activeChat ? updatedChat : conversation));
      setMessageInput("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updatePhase = async (event) => {
    try {
      const updatedChat = await apiRequest(`/chats/${conversations[activeChat].id}/phase`, {
        method: "PATCH",
        body: JSON.stringify({ accountId: account.id, role: "company", phase: event.target.value }),
      });
      setConversations((current) => current.map((conversation, index) => index === activeChat ? updatedChat : conversation));
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
            <div className="chat-main-avatar">{activeConversation.devInitials}</div>
            <div>
              <h4>{activeConversation.devName}</h4>
              <span className="chat-status">{activeConversation.devTitle}</span>
            </div>
            <label className="phase-select">
              <span>Phase</span>
              <select value={activeConversation.phase} onChange={updatePhase}>
                {pipelineStages.map((stage) => <option key={stage}>{stage}</option>)}
              </select>
            </label>
          </div>

          <div className="chat-messages">
            {activeConversation.messages.map((message, index) => (
              <div key={`${message.time}-${index}`} className={`chat-bubble ${message.from === "company" ? "chat-bubble-sent" : "chat-bubble-received"}`}>
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

export default CompanyChat;
