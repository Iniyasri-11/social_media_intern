/**
 * authService.js
 *
 * Calls the FastAPI backend (/api/auth/*) for all auth operations.
 * No email. No Supabase Auth SDK.
 * - signup: username, phone_number, password → stored in Supabase `users` table
 * - login:  username, password             → validates against hashed password
 */

const BASE = "/api/auth";

/** Safely parse JSON — returns null if body is empty or not JSON */
async function _safeJson(res) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export const authService = {
  async signUp({ username, password, userData }) {
    const res = await fetch(`${BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        phone_number: userData?.phone_number || "",
      }),
    });
    const data = await _safeJson(res);
    if (!res.ok) throw new Error(data?.detail || `Server error ${res.status}. Check if the backend is running.`);
    return data;
  },

  async signIn({ username, password }) {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await _safeJson(res);
    if (!res.ok) throw new Error(data?.detail || `Server error ${res.status}. Check if the backend is running.`);
    return data;
  },

  async signOut() {
    await fetch(`${BASE}/logout`, { method: "POST" });
  },

  /** Persist session to localStorage */
  saveSession(userData, token) {
    localStorage.setItem("pulse_user", JSON.stringify(userData));
    localStorage.setItem("pulse_token", token);
  },

  /** Load session from localStorage */
  loadSession() {
    try {
      const user = JSON.parse(localStorage.getItem("pulse_user"));
      const token = localStorage.getItem("pulse_token");
      if (user && token) return { user, token };
    } catch (_) {}
    return null;
  },

  /** Clear session from localStorage */
  clearSession() {
    localStorage.removeItem("pulse_user");
    localStorage.removeItem("pulse_token");
  },
};
