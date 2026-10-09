import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCheck, MessageSquare, RefreshCw, Search, Send } from "lucide-react";
import useConversations from "../hooks/useConversations";

const phases = ["Intro", "Screening", "Technical Interview", "Final Interview", "Offer", "Negotiation", "Hired", "Rejected"];
const time = (value) => value && !Number.isNaN(Date.parse(value))
  ? new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "";
const day = (value) => value && !Number.isNaN(Date.parse(value))
  ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "";

export default function ChatWorkspace({ role }) {
  const company = role === "company";
  const { conversations, loading, error, connected, refresh, mutate } = useConversations();
  const [params, setParams] = useSearchParams();
  const [drafts, setDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [sendingId, setSendingId] = useState(null);
  const [changingPhase, setChangingPhase] = useState(false);
  const [actionError, setActionError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(Boolean(params.get("chat")));
  const [visible, setVisible] = useState(document.visibilityState === "visible");
  const messagesEl = useRef(null);
  const stickToBottom = useRef(true);
  const pendingMessages = useRef({});
  const sending = useRef(false);
  const reading = useRef(false);
  const active = conversations.find((chat) => chat.id === params.get("chat")) || conversations[0];
  const activeId = active?.id;
  const draft = drafts[activeId] || "";
  const peerName = (chat) => company ? chat.developerName || chat.devName : chat.companyName;
  const peerInitials = (chat) => company ? chat.devInitials : chat.companyInitials;
  const filtered = conversations.filter((chat) => `${peerName(chat)} ${chat.lastMessage} ${chat.phase}`.toLowerCase().includes(search.toLowerCase()));
  const lastMessageId = active?.messages.at(-1)?.id;
  const unread = active?.unread || 0;

  useEffect(() => {
    if (activeId && !params.get("chat")) setParams({ chat: activeId }, { replace: true });
  }, [activeId, params, setParams]);

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!activeId || !lastMessageId || !unread || !visible || reading.current || (!mobileOpen && window.innerWidth <= 700)) return;
    reading.current = true;
    mutate(`/chats/${activeId}/read`, { method: "PATCH", body: JSON.stringify({ lastMessageId }) }, true)
      .catch((err) => setActionError(err.message))
      .finally(() => { reading.current = false; });
  }, [activeId, lastMessageId, unread, visible, mobileOpen, mutate, active?.messages]);

  useEffect(() => {
    stickToBottom.current = true;
    messagesEl.current?.scrollTo({ top: messagesEl.current.scrollHeight });
  }, [activeId, mobileOpen]);

  useEffect(() => {
    if (stickToBottom.current) messagesEl.current?.scrollTo({ top: messagesEl.current.scrollHeight, behavior: "smooth" });
  }, [lastMessageId]);

  const selectChat = (id) => {
    setParams({ chat: id }, { replace: true });
    setMobileOpen(true);
    setActionError("");
  };

  const send = async (event) => {
    event.preventDefault();
    if (sending.current || !activeId || !draft.trim()) return;
    const id = activeId;
    const text = draft.trim();
    let pending = pendingMessages.current[id];
    if (!pending || pending.text !== text) pending = { text, clientMessageId: crypto.randomUUID() };
    pendingMessages.current[id] = pending;
    sending.current = true;
    setSendingId(id);
    setActionError("");
    try {
      await mutate(`/chats/${id}/messages`, { method: "POST", body: JSON.stringify(pending) });
      setDrafts((current) => ({ ...current, [id]: current[id]?.trim() === text ? "" : current[id] }));
      delete pendingMessages.current[id];
      stickToBottom.current = true;
    } catch (err) { setActionError(err.message); }
    finally { sending.current = false; setSendingId(null); }
  };

  const changePhase = async (event) => {
    if (changingPhase || !activeId) return;
    setChangingPhase(true);
    setActionError("");
    try { await mutate(`/chats/${activeId}/phase`, { method: "PATCH", body: JSON.stringify({ phase: event.target.value }) }); }
    catch (err) { setActionError(err.message); }
    finally { setChangingPhase(false); }
  };

  return (
    <main className={`chat-container ${mobileOpen ? "conversation-open" : ""}`}>
      <div className="chat-page-heading"><h1>Messages</h1><span className={`connection-status ${connected ? "connected" : ""}`}><i />{connected ? "Updates automatically" : loading ? "Connecting…" : "Reconnecting…"}</span></div>
      {(actionError || error) && <div className="error-banner chat-error" role="alert"><span>{actionError || error}</span><button type="button" className="btn-text" onClick={refresh}><RefreshCw size={14} /> Retry</button></div>}
      <div className="chat-layout">
        <aside className="chat-sidebar" aria-label="Conversations">
          <div className="chat-sidebar-header"><div><h2>Conversations</h2><span>{conversations.length} {company ? conversations.length === 1 ? "candidate" : "candidates" : conversations.length === 1 ? "company" : "companies"}</span></div><Link to={company ? "/hire" : "/dev-dashboard"} className="chat-back-link" aria-label={company ? "Browse developers" : "Back to dashboard"}><ArrowLeft size={17} /></Link></div>
          <label className="search-field chat-search"><Search size={16} /><input aria-label="Search conversations" placeholder="Search conversations" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <div className="chat-list">
            {filtered.map((chat) => <button type="button" key={chat.id} className={`chat-list-item ${activeId === chat.id ? "active" : ""}`} onClick={() => selectChat(chat.id)} aria-pressed={activeId === chat.id}>
              <span className="chat-list-avatar">{peerInitials(chat)}</span><span className="chat-list-info"><span className="chat-list-top"><span className="chat-list-name">{peerName(chat)}</span><span className="chat-list-time">{time(chat.time)}</span></span><span className="chat-list-preview">{chat.lastMessage || "Start a conversation"}</span><span className="chat-list-bottom"><span className="phase-label">{chat.phase}</span>{chat.unread > 0 && <span className="chat-unread-badge" aria-label={`${chat.unread} unread messages`}>{chat.unread}</span>}</span></span>
            </button>)}
            {loading && <p className="chat-list-note" role="status">Loading conversations…</p>}
            {!loading && filtered.length === 0 && <p className="chat-list-note">{search ? "No conversations match your search." : "Your conversations will appear here."}</p>}
          </div>
        </aside>
        {active ? <section className="chat-main" aria-label={`Conversation with ${peerName(active)}`}>
          <header className="chat-main-header"><button type="button" className="mobile-chat-back icon-button" aria-label="Back to conversations" onClick={() => setMobileOpen(false)}><ArrowLeft size={19} /></button><span className="chat-main-avatar">{peerInitials(active)}</span><div className="chat-person"><h2>{peerName(active)}</h2><span className="chat-status">{company ? active.devTitle || "Developer" : active.phase}</span></div>
            {company && <label className="phase-select"><span>Hiring stage</span><select aria-label="Hiring stage" value={active.phase} onChange={changePhase} disabled={changingPhase}>{[...new Set([...phases, active.phase])].filter(Boolean).map((phase) => <option key={phase}>{phase}</option>)}</select></label>}
          </header>
          <div className="chat-messages" ref={messagesEl} role="log" aria-label="Messages" aria-live="polite" aria-relevant="additions" onScroll={(event) => { const el = event.currentTarget; stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; }}>
            {!active.messages.length && <div className="chat-thread-empty"><MessageSquare size={28} /><h3>Say hello to {peerName(active)}</h3><p>Start with a quick introduction.</p></div>}
            {active.messages.map((message, index) => {
              const own = message.from === (company ? "company" : "dev");
              return <div className="chat-message-group" key={message.id || `${message.time}-${index}`}>
                {(!index || day(message.time) !== day(active.messages[index - 1].time)) && <div className="chat-date">{day(message.time)}</div>}
                <div className={`chat-bubble ${own ? "chat-bubble-sent" : "chat-bubble-received"}`}><p>{message.text}</p><span className="chat-bubble-time">{time(message.time)}{own && <span aria-label={message.readAt ? "Read" : "Sent"} title={message.readAt ? "Read" : "Sent"}>{message.readAt ? <CheckCheck size={14} /> : <Check size={14} />}</span>}</span></div>
              </div>;
            })}
          </div>
          <form className="chat-input-area" onSubmit={send}><div className="chat-composer"><textarea aria-label="Message" rows={2} placeholder="Write a message…" value={draft} maxLength={5000} onChange={(event) => setDrafts((current) => ({ ...current, [activeId]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(event); } }} /><span className="composer-hint">Enter to send · Shift + Enter for a new line{draft.length > 4500 && ` · ${draft.length}/5000`}</span></div><button type="submit" className="chat-send-btn" disabled={!draft.trim() || Boolean(sendingId)} aria-label={sendingId === activeId ? "Sending message" : "Send message"}>{sendingId === activeId ? <RefreshCw size={18} className="spin-icon" /> : <Send size={18} />}</button></form>
        </section> : <section className="chat-main chat-empty-state"><MessageSquare size={36} /><h2>{loading ? "Loading your messages…" : "Good conversations start here"}</h2><p>{company ? "Find a developer and reach out to discuss your next opportunity." : "When a company reaches out, you can talk through the opportunity here."}</p>{company && !loading && <Link to="/hire" className="btn-primary">Browse developers</Link>}</section>}
      </div>
    </main>
  );
}
