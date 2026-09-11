import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAuth } from "../api";

const initialFormData = {
  companyName: "",
  workEmail: "",
  phoneNumber: "",
  password: "",
  startYear: "",
  totalBranches: "",
  location: "",
  employeeCount: "",
  website: "",
  industry: "",
  description: "",
};

const CompanyLogin = () => {
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
    const endpoint = isLogin ? "/api/auth/company/login" : "/api/auth/company/signup";

    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startYear: Number(formData.startYear),
          totalBranches: Number(formData.totalBranches),
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

      saveAuth(data.account, "company");
      navigate("/hire");
    } catch (err) {
      setError(err.message || "Failed to connect to server.");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <span className="eyebrow">Company access</span>
          <h1>{isLogin ? "Company sign in" : "Create company profile"}</h1>
          <p>
            {isLogin
              ? "Sign in to browse developers and manage hiring conversations."
              : "Create your company profile to get started."}
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <label>
                <span>Company name</span>
                <input name="companyName" value={formData.companyName} onChange={handleChange} required />
              </label>
              <label>
                <span>Phone number</span>
                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
              </label>
              <label>
                <span>Start year</span>
                <input type="number" min="1800" max="2026" name="startYear" value={formData.startYear} onChange={handleChange} required />
              </label>
              <label>
                <span>Total branches</span>
                <input type="number" min="1" name="totalBranches" value={formData.totalBranches} onChange={handleChange} required />
              </label>
              <label>
                <span>Location</span>
                <input name="location" value={formData.location} onChange={handleChange} required />
              </label>
              <label>
                <span>People working there</span>
                <select name="employeeCount" value={formData.employeeCount} onChange={handleChange} required>
                  <option value="">Select size</option>
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>201-1000</option>
                  <option>1000+</option>
                </select>
              </label>
              <label>
                <span>Website</span>
                <input name="website" value={formData.website} onChange={handleChange} placeholder="https://company.com" />
              </label>
              <label>
                <span>Industry</span>
                <input name="industry" value={formData.industry} onChange={handleChange} placeholder="SaaS, fintech, agency..." />
              </label>
              <label className="auth-span-2">
                <span>Company description</span>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} />
              </label>
            </>
          )}

          <label>
            <span>Work email</span>
            <input type="email" name="workEmail" value={formData.workEmail} onChange={handleChange} required />
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
            {isLogin ? "Need a company account?" : "Already registered?"}{" "}
            <button type="button" className="text-button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </p>
          <Link to="/login" className="text-button">Developer access</Link>
        </div>
      </section>
    </main>
  );
};

export default CompanyLogin;
