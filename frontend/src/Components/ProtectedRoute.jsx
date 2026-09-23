import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authRequest, clearAuth, dashboardFor, getAuth, saveAuth } from "../api";

const ProtectedRoute = ({ role }) => {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, account: getAuth() });

  useEffect(() => {
    let mounted = true;
    authRequest("/auth/me")
      .then(({ account }) => {
        if (!mounted) return;
        saveAuth(account, account.role);
        setState({ loading: false, account });
      })
      .catch(() => {
        clearAuth();
        if (mounted) setState({ loading: false, account: null });
      });
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  if (state.loading) return <main className="workflow-page"><section className="panel">Checking access...</section></main>;

  const account = state.account;

  if (!account) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (account.role !== role) {
    return <Navigate to={dashboardFor(account.role)} replace />;
  }

  if (account.verificationStatus !== "verified") {
    return <Navigate to="/waiting-review" replace state={{ account }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
