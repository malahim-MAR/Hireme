import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, MessageSquare, UserRoundCheck } from "lucide-react";
import { apiRequest, getAuth } from "../api";

const DevDashboard = () => {
  const account = getAuth();
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account?.id) return;
    apiRequest(`/chats?accountId=${account.id}&role=developer`)
      .then(setConversations)
      .catch((requestError) => setError(requestError.message));
  }, [account?.id]);

  const activeCompanies = conversations.length;
  const unreadMessages = conversations.reduce((total, conversation) => total + conversation.unread, 0);
  const lateStage = conversations.filter((conversation) => (
    conversation.phase === "Technical Interview" || conversation.phase === "Negotiation"
  )).length;
  const pipelineStages = useMemo(() => [...new Set(conversations.map((conversation) => conversation.phase).filter(Boolean))], [conversations]);

  return (
    <main className="workflow-page">
      <div className="workflow-shell">
        <header className="workflow-header">
          <div>
            <span className="eyebrow">Developer dashboard</span>
            <h1>Your company pipeline</h1>
            <p>See who reached out, which phase each company is in, and what needs a reply.</p>
          </div>
          <div className="workflow-actions">
            <Link to="/dev-profile" className="btn-secondary-action">Edit profile</Link>
            <Link to="/dev-chat" className="btn-primary-action">Open chats</Link>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <section className="metric-grid" aria-label="Developer outreach metrics">
          <article className="metric-card">
            <Building2 size={20} />
            <span>Companies reached out</span>
            <strong>{activeCompanies}</strong>
          </article>
          <article className="metric-card">
            <MessageSquare size={20} />
            <span>Unread messages</span>
            <strong>{unreadMessages}</strong>
          </article>
          <article className="metric-card">
            <UserRoundCheck size={20} />
            <span>Late stage talks</span>
            <strong>{lateStage}</strong>
          </article>
        </section>

        <div className="dashboard-two-col">
          <section className="panel">
            <div className="panel-header">
              <h2>Company phases</h2>
              <span>{activeCompanies} active</span>
            </div>
            <div className="company-phase-list">
              {conversations.map((conversation) => (
                <article className="company-phase-card" key={conversation.id}>
                  <span className="avatar-token">{conversation.companyInitials}</span>
                  <div>
                    <strong>{conversation.companyName}</strong>
                    <p>{conversation.lastMessage}</p>
                  </div>
                  <span className="phase-pill">{conversation.phase}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Phase checklist</h2>
              <span>Progress view</span>
            </div>
            <div className="stage-list">
              {pipelineStages.map((stage) => {
                const count = conversations.filter((conversation) => conversation.phase === stage).length;
                return (
                  <div className="stage-row" key={stage}>
                    <span>{stage}</span>
                    <div className="stage-meter" aria-hidden="true">
                      <span style={{ width: `${(count / activeCompanies) * 100}%` }} />
                    </div>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default DevDashboard;
