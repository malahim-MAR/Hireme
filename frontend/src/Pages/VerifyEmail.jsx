import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

const VerifyEmail = () => {
  const { role, token } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: "", message: "" });

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/auth/verify/${role}/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setState({ loading: false, error: data.message || "Verification failed.", message: "" });
          return;
        }

        setState({ loading: false, error: "", message: data.message });
        setTimeout(() => {
          navigate("/waiting-review", { state: { account: data.account } });
        }, 1200);
      } catch (error) {
        setState({ loading: false, error: error.message, message: "" });
      }
    };

    verify();
  }, [navigate, role, token]);

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">
        {state.loading && (
          <>
            <div className="auth-icon"><Loader2 size={28} className="spin-icon" /></div>
            <h1>Verifying email</h1>
            <p>Please wait while we confirm your email address.</p>
          </>
        )}
        {!state.loading && state.message && (
          <>
            <div className="auth-icon success"><CheckCircle2 size={28} /></div>
            <h1>Email verified</h1>
            <p>{state.message}</p>
          </>
        )}
        {!state.loading && state.error && (
          <>
            <div className="auth-icon danger"><XCircle size={28} /></div>
            <h1>Verification failed</h1>
            <p>{state.error}</p>
            <Link to="/" className="btn-secondary-action auth-full-button">Back to home</Link>
          </>
        )}
      </section>
    </main>
  );
};

export default VerifyEmail;
