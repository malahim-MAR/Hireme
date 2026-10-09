export const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
export const getAuth = () => {
  try { return JSON.parse(localStorage.getItem("hiremeAccount") || "null"); }
  catch { return null; }
};
export const getToken = () => localStorage.getItem("hiremeToken");
export const getAdminToken = () => localStorage.getItem("hiremeAdminToken");
export const dashboardFor = (role) => role === "company" ? "/company-dashboard" : "/dev-dashboard";
export const saveAuth = (account, role, token) => {
  localStorage.setItem("hiremeAccount", JSON.stringify({ ...account, role: account.role || role }));
  if (token) localStorage.setItem("hiremeToken", token);
  window.dispatchEvent(new Event("hireme-auth"));
};
export const saveAdminToken = (token) => localStorage.setItem("hiremeAdminToken", token);
export const clearAuth = () => {
  localStorage.removeItem("hiremeAccount");
  localStorage.removeItem("hiremeToken");
  window.dispatchEvent(new Event("hireme-auth"));
};
export const clearAdminAuth = () => localStorage.removeItem("hiremeAdminToken");
const request = async (path, options, token) => {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options, credentials: "include",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
      signal: options.signal || AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(error.name === "TimeoutError" ? "The request timed out. Please try again." : "Unable to connect. Check your connection and try again.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status}). Please try again.`);
    error.status = response.status;
    throw error;
  }
  if (!data) throw new Error("The server returned an unexpected response.");
  return data;
};
export const apiRequest = (path, options = {}) => request(path, options, getToken());
export const authRequest = apiRequest;
export const adminRequest = (path, options = {}) => request(path, options, getAdminToken());
