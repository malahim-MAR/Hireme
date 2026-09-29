import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, getAuth } from "../api";

const PIPELINE_STAGES = ["Intro", "Screening", "Interview", "Offer", "Hired"];

const phaseMatchesStage = (phase = "", stage = "") => {
  const normalizedPhase = phase.toLowerCase();
  const normalizedStage = stage.toLowerCase();
  if (normalizedStage === "interview") return normalizedPhase.includes("interview");
  return normalizedPhase === normalizedStage;
};

const PipelineTracker = ({ currentPhase }) => {
  const currentIndex = PIPELINE_STAGES.findIndex(
    (stage) => phaseMatchesStage(currentPhase, stage)
  );
  return (
    <div className="pipeline-tracker dev" role="list">
      {PIPELINE_STAGES.map((stage, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <div
            key={stage}
            className={`pipeline-step${isDone ? " done" : ""}${isActive ? " active" : ""}`}
            role="listitem"
            aria-current={isActive ? "step" : undefined}
          >
            <div className="pipeline-step-dot" />
            <span className="pipeline-step-label">{stage}</span>
          </div>
        );
      })}
    </div>
  );
};

const DevDashboard = () => {
  const account = getAuth();
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account?.id) return;
    apiRequest("/chats")
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
            <span className="section-label">Developer dashboard</span>
            <h1>Your company pipeline</h1>
            <p>See who reached out, which phase each company is in, and what needs a reply.</p>
          </div>
          <div className="workflow-actions">
            <Link to="/dev-profile" className="btn-text">Edit profile</Link>
            <Link to="/dev-chat" className="btn-primary dev">Open chats</Link>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {/* Ledger row — single strip, no boxes */}
        <div className="ledger-row" aria-label="Developer outreach metrics">
          <div className="ledger-cell">
            <span className="ledger-number">{activeCompanies}</span>
            <span className="ledger-label">Companies reached out</span>
          </div>
          <div className="ledger-cell">
            <span className="ledger-number">{unreadMessages}</span>
            <span className="ledger-label">Unread messages</span>
          </div>
          <div className="ledger-cell">
            <span className="ledger-number">{lateStage}</span>
            <span className="ledger-label">Late stage talks</span>
          </div>
        </div>

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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>{conversation.companyName}</strong>
                    <p>{conversation.lastMessage}</p>
                  </div>
                  <span className="phase-label">{conversation.phase}</span>
                </article>
              ))}
              {conversations.length === 0 && (
                <p className="empty-note">No active conversations yet.</p>
              )}
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
                const pct = activeCompanies ? Math.round((count / activeCompanies) * 100) : 0;
                return (
                  <div key={stage} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)", fontSize: "14px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>{stage}</span>
                    <strong style={{ fontFamily: "var(--font-display)", fontSize: "16px" }}>{count}</strong>
                  </div>
                );
              })}
              {pipelineStages.length === 0 && (
                <p className="empty-note">No phase data yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Pipeline tracker — visual metaphor for conversation stages */}
        {conversations.length > 0 && (
          <section className="panel" style={{ marginTop: "0" }}>
            <div className="panel-header">
              <h2>Pipeline overview</h2>
              <span>Hiring stages</span>
            </div>
            <PipelineTracker currentPhase={conversations[0]?.phase} />
          </section>
        )}
      </div>
    </main>
  );
};

export default DevDashboard;
