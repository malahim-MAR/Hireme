const API_BASE = "http://localhost:5001/api";

export const getAuth = () => {
  try {
    return JSON.parse(localStorage.getItem("hiremeAccount") || "null");
  } catch {
    return null;
  }
};

export const getToken = () => localStorage.getItem("hiremeToken");

export const getAdminToken = () => localStorage.getItem("hiremeAdminToken");

export const dashboardFor = (role) => role === "company" ? "/company-dashboard" : "/dev-dashboard";

export const saveAuth = (account, role, token) => {
  localStorage.setItem("hiremeAccount", JSON.stringify({ ...account, role: account.role || role }));
  if (token) localStorage.setItem("hiremeToken", token);
};

export const saveAdminToken = (token) => localStorage.setItem("hiremeAdminToken", token);

export const clearAuth = () => {
  localStorage.removeItem("hiremeAccount");
  localStorage.removeItem("hiremeToken");
};

export const clearAdminAuth = () => localStorage.removeItem("hiremeAdminToken");

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
};

export const authRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
};

export const adminRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
};
