// src/utils/auth.js

// Use relative URL - Vite proxy will forward to Flask
const API_BASE = "/api";

export async function register(username, password, email) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
  });
  const data = await res.json();
  if (data.success && data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (data.success && data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

export function logout() {
  localStorage.removeItem("token");
}

export function getToken() {
  return localStorage.getItem("token");
}

export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;
  
  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!data.success) return null;
    return data.user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}