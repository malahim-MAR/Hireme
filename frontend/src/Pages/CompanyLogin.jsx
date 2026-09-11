import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CompanyLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    companyName: "",
    workEmail: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/auth/company/login" : "/api/auth/company/signup";
    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`${isLogin ? "Company Login" : "Company Signup"} successful:`, data);
        navigate("/hire");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to server");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {isLogin ? "Hire Talent" : "Scale Faster"}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? "Access top developers for your projects"
              : "Register your company to post vacancies"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                name="companyName"
                placeholder="Ex: Acme Inc."
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Work Email</label>
            <input
              type="email"
              name="workEmail"
              placeholder="hr@company.com"
              value={formData.workEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {isLogin && (
            <div className="auth-forgot">
              <a href="#">Forgot company credentials?</a>
            </div>
          )}

          <button type="submit" className="auth-btn">
            {isLogin ? "Company Sign in" : "Register Company"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-toggle">
          {isLogin ? (
            <p>
              New here?{" "}
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setIsLogin(false)}
              >
                Register your business
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setIsLogin(true)}
              >
                Business sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin;
