import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuth } from "../api";

const ProtectedRoute = ({ role }) => {
  const location = useLocation();
  const account = getAuth();

  if (!account) {
    return <Navigate to={role === "company" ? "/company-login" : "/login"} replace state={{ from: location }} />;
  }

  if (account.role !== role) {
    return <Navigate to={account.role === "company" ? "/company-dashboard" : "/dev-dashboard"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;