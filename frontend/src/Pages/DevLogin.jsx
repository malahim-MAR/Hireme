import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAuth } from "../api";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  currentCompany: "",
  yearsOfExperience: "",
  linkedinProfile: "",
  phoneNumber: "",
  location: "",
  portfolio: "",
  primarySkills: "",
};

const DevLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const endpoint = isLogin ? "/api/auth/developer/login" : "/api/auth/developer/signup";

    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          yearsOfExperience: Number(formData.yearsOfExperience),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      if (!isLogin) {
        setIsLogin(true);
        setError("Account created. Please sign in.");
        return;
      }

      saveAuth(data.account, "developer");
      navigate("/dev-dashboard");
    } catch (err) {
      setError(err.message || "Failed to connect to server.");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <span className="eyebrow">Developer access</span>
          <h1>{isLogin ? "Developer sign in" : "Create developer profile"}</h1>
          <p>
            {isLogin
              ? "Sign in to manage company outreach and conversations."
              : "Create your developer profile to get started."}
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <label>
                <span>Full name</span>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </label>
              <label>
                <span>Company you work in</span>
                <input name="currentCompany" value={formData.currentCompany} onChange={handleChange} required />
              </label>
              <label>
                <span>Years of experience</span>
                <input type="number" min="0" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} required />
              </label>
              <label>
                <span>LinkedIn profile</span>
                <input type="url" name="linkedinProfile" value={formData.linkedinProfile} onChange={handleChange} required />
              </label>
              <label>
                <span>Phone number</span>
                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
              </label>
              <label>
                <span>Location</span>
                <input name="location" value={formData.location} onChange={handleChange} />
              </label>
              <label>
                <span>Portfolio</span>
                <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} />
              </label>
              <label>
                <span>Primary skills</span>
                <input name="primarySkills" value={formData.primarySkills} onChange={handleChange} placeholder="React, Node.js, MongoDB" />
              </label>
            </>
          )}

          <label>
            <span>Email</span>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </label>

          <button type="submit" className="btn-primary-action auth-submit">
            {isLogin ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Need a developer account?" : "Already registered?"}{" "}
            <button type="button" className="text-button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </p>
          <Link to="/company-login" className="text-button">Company access</Link>
        </div>
      </section>
    </main>
  );
};

export default DevLogin;
