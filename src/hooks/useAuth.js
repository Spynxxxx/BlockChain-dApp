// useAuth.js
// Handles all user authentication calls to the Express/MongoDB backend.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Get user profile from MongoDB ────────────────────────────
// Returns { username, courseCode } if found, or null if new user
export async function getUserProfile(walletAddress) {
  let res;
  try {
    res = await fetch(
      `${API_URL}/api/users/${encodeURIComponent(walletAddress)}`,
    );
  } catch (networkErr) {
    throw new Error("NETWORK_ERROR");
  }

  if (res.status === 404) return null; // new user — not registered yet
  if (!res.ok) throw new Error("NETWORK_ERROR");

  const data = await res.json();
  return {
    username: data.username,
    courseCode: data.courseCode,
  };
}

// ── Register a new user in MongoDB ───────────────────────────
// Returns the created user object
export async function registerUser(walletAddress, courseCode, username) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, courseCode, username }),
    });
  } catch (networkErr) {
    throw new Error("NETWORK_ERROR");
  }

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Registration failed");
  }

  return await res.json();
}
