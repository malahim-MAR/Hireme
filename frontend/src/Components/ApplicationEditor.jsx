import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { apiRequest } from "../api";

const empty = { First_Name: "", Last_Name: "", Email: "", Phone: "", Job_Title: "", Company: "", Status: "Applied", Cover_Letter: "" };
const fields = [["First_Name", "First name"], ["Last_Name", "Last name"], ["Email", "Email", "email"], ["Phone", "Phone", "tel"], ["Job_Title", "Job title"], ["Company", "Company"]];

export default function ApplicationEditor({ editing = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    if (!editing) return;
    let mounted = true;
    apiRequest(`/notes/${id}`).then((data) => { if (mounted) setForm({ ...empty, ...data }); })
      .catch((err) => { if (mounted) { setError(err.message); setLoadFailed(true); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id, editing]);
  const save = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await apiRequest(editing ? `/notes/${id}` : "/notes", { method: editing ? "PUT" : "POST", body: JSON.stringify(form) });
      navigate("/");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (busy || !window.confirm("Delete this application permanently?")) return;
    setBusy(true);
    setError("");
    try { await apiRequest(`/notes/${id}`, { method: "DELETE" }); navigate("/"); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="auth-card">
    <Link to="/" className="btn-text" style={{ marginBottom: 24 }}><ArrowLeft size={15} /> Home</Link>
    <header className="auth-header"><span className="section-label">Applications</span><h1>{editing ? "Edit application" : "New application"}</h1><p>Keep the details of your next opportunity in one place.</p></header>
    {error && <div className="error-banner" role="alert">{error}</div>}
    {loading ? <p className="empty-note" role="status">Loading application…</p> : !loadFailed && <form className="auth-form" onSubmit={save}>
      {fields.map(([name, label, type]) => <label key={name}><span>{label}{name === "Phone" ? " (optional)" : ""}</span><input name={name} type={type || "text"} value={form[name]} required={name !== "Phone"} onChange={(event) => setForm({ ...form, [name]: event.target.value })} /></label>)}
      <label className="auth-span-2"><span>Stage</span><select value={form.Status} onChange={(event) => setForm({ ...form, Status: event.target.value })}><option value="Applied">Applied</option><option value="Interview">Interviewing</option><option value="Offer">Offer received</option><option value="Rejected">Rejected</option></select></label>
      <label className="auth-span-2"><span>Cover letter</span><textarea rows={5} value={form.Cover_Letter} required onChange={(event) => setForm({ ...form, Cover_Letter: event.target.value })} /></label>
      <button type="submit" className="btn-primary auth-submit" disabled={busy}><Save size={15} />{busy ? "Saving…" : "Save application"}</button>
      {editing && <button type="button" className="danger-button auth-span-2" disabled={busy} onClick={remove}><Trash2 size={15} /> Delete application</button>}
    </form>}
  </section></main>;
}
