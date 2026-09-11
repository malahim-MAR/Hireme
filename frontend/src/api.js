const API_BASE = "http://localhost:5001/api";

export const getAuth = () => {
  try {
    return JSON.parse(localStorage.getItem("hiremeAccount") || "null");
  } catch {
    return null;
  }
};

export const saveAuth = (account, role) => {
  localStorage.setItem("hiremeAccount", JSON.stringify({ ...account, role }));
};

export const clearAuth = () => localStorage.removeItem("hiremeAccount");

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
};
