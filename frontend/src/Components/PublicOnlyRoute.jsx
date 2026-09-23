import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authRequest, clearAuth, dashboardFor, getAuth, saveAuth } from "../api";

const PublicOnlyRoute = ({ allowUnverified = false }) => {
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
  if (!state.account) return <Outlet />;
  if (state.account.verificationStatus === "verified") return <Navigate to={dashboardFor(state.account.role)} replace />;
  if (allowUnverified) return <Outlet />;
  return <Navigate to="/waiting-review" replace />;
};

export default PublicOnlyRoute;
