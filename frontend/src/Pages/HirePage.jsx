import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Filter, MapPin, MessageSquare, Search, X } from "lucide-react";
import { apiRequest } from "../api";

const HirePage = () => {
  const [filters, setFilters] = useState({
    search: "",
    level: "All",
    availability: "All",
    stack: "All",
  });
  const [developers, setDevelopers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(null);
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("/developers")
      .then(setDevelopers)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const stacks = useMemo(() => [...new Set(developers.flatMap((dev) => dev.skills))], [developers]);

  const filteredDevelopers = developers.filter((dev) => {
    const search = filters.search.toLowerCase();
    const searchable = `${dev.name} ${dev.title} ${dev.city} ${dev.country} ${dev.skills.join(" ")}`.toLowerCase();

    return (
      (!search || searchable.includes(search)) &&
      (filters.level === "All" || dev.level === filters.level) &&
      (filters.availability === "All" || dev.availability === filters.availability) &&
      (filters.stack === "All" || dev.skills.includes(filters.stack))
    );
  });

  const updateFilter = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const contactDeveloper = async (developerId) => {
    if (contacting) return;
    setContacting(developerId);
    setError("");
    try {
      const chat = await apiRequest("/chats", {
        method: "POST",
        body: JSON.stringify({ developerId }),
      });
      navigate(`/company-chat?chat=${chat.id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setContacting(null);
    }
  };

  return (
    <main className="workflow-page">
      <div className="workflow-shell">
        <header className="workflow-header">
          <div>
            <span className="section-label">Find talent</span>
            <h1>A great team starts here.</h1>
            <p>Explore verified developers and find the right person for your next chapter.</p>
          </div>
          <div className="workflow-actions">
            <Link to="/company-dashboard" className="btn-text">Dashboard</Link>
            <Link to="/company-chat" className="btn-primary company">
              <MessageSquare size={15} /> Messages
            </Link>
          </div>
        </header>

        <section className="filter-strip">
          <label className="search-field">
            <Search size={15} />
            <input
              name="search"
              value={filters.search}
              onChange={updateFilter}
              placeholder="Search name, role, country, or skill"
              aria-label="Search developers"
            />
          </label>
          <select name="level" aria-label="Experience level" value={filters.level} onChange={updateFilter}>
            <option value="All">All levels</option>
            <option>Junior</option>
            <option>Mid</option>
            <option>Senior</option>
          </select>
          <select name="stack" aria-label="Skills" value={filters.stack} onChange={updateFilter}>
            <option value="All">All skills</option>
            {stacks.map((stack) => <option key={stack}>{stack}</option>)}
          </select>
          <select name="availability" aria-label="Availability" value={filters.availability} onChange={updateFilter}>
            <option value="All">Any availability</option>
            <option>Immediately</option>
            <option>Within 2 weeks</option>
            <option>Within 1 month</option>
          </select>
        </section>

        <div className="result-line">
          <Filter size={14} />
          <span>{filteredDevelopers.length} of {developers.length} developers shown</span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="hire-grid">
          {filteredDevelopers.map((dev) => (
            <article className="hire-card" key={dev.id}>
              <div className="hire-card-top">
                {/* Flat initials chip — no rounded square, no shadow */}
                <div className="hire-card-avatar">{dev.initials}</div>
                <div>
                  <h3 className="hire-card-name">{dev.name}</h3>
                  <p className="hire-card-title">{dev.title}</p>
                </div>
              </div>

              <p className="hire-card-bio">{dev.bio}</p>

              <div className="hire-card-skills">
                {dev.skills.map((skill) => (
                  <span className="skill-tag-mono" key={skill}>{skill}</span>
                ))}
              </div>

              <div className="hire-card-meta">
                <span><MapPin size={13} /> {[dev.city, dev.country].filter(Boolean).join(", ") || "Location not provided"}</span>
                <span>{dev.level} / {dev.experience}</span>
                <span className={`hire-avail ${dev.availability === "Immediately" ? "avail-now" : ""}`}>
                  {dev.availability}
                </span>
              </div>

              <div className="hire-card-actions">
                <button className="btn-text btn-sm" type="button" onClick={() => { setSelected(dev); dialog.current.showModal(); }}>View profile</button>
                <button
                  type="button"
                  className="btn-primary company btn-sm"
                  onClick={() => contactDeveloper(dev.id)}
                  disabled={Boolean(contacting)}
                >
                  {contacting === dev.id ? "Opening…" : "Contact"}
                </button>
              </div>
            </article>
          ))}
          {loading && <section className="empty-panel" role="status">Loading developers…</section>}
          {!loading && !filteredDevelopers.length && <section className="empty-panel"><h2>{developers.length ? "No matches yet" : "New talent is on the way"}</h2><p>{developers.length ? "Try a different search or clear your filters." : "Verified developer profiles will appear here."}</p>{developers.length > 0 && <button type="button" className="btn-text" onClick={() => setFilters({ search: "", level: "All", availability: "All", stack: "All" })}>Clear filters</button>}</section>}
        </div>
        <dialog ref={dialog} className="profile-modal" onClick={(event) => { if (event.target === event.currentTarget) dialog.current.close(); }}>
          {selected && <><div className="profile-modal-header"><div><span className="section-label">Developer profile</span><h2>{selected.profile?.fullName || selected.name}</h2><p>{selected.title}</p></div><button type="button" className="icon-button" aria-label="Close profile" onClick={() => dialog.current.close()}><X size={18} /></button></div><p>{selected.bio || "This developer hasn't added a bio yet."}</p><div className="hire-card-skills">{selected.skills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}</div><div className="profile-form-grid"><div><span className="section-label">Experience</span>{selected.experience}</div><div><span className="section-label">Location</span>{[selected.city, selected.country].filter(Boolean).join(", ") || "Not provided"}</div><div><span className="section-label">Availability</span>{selected.availability || "Not provided"}</div><div><span className="section-label">Education</span>{selected.profile?.education || "Not provided"}</div></div><div className="workflow-actions" style={{ marginTop: 24 }}><button type="button" className="btn-primary" disabled={Boolean(contacting)} onClick={() => contactDeveloper(selected.id)}>Start a conversation</button></div></>}
        </dialog>
      </div>
    </main>
  );
};

export default HirePage;
