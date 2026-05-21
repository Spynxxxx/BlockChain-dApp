const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function getUserProfile(walletAddress) {
  let res;
  try {
    res = await fetch(
      `${API_URL}/api/users/${encodeURIComponent(walletAddress)}`,
    );
  } catch {
    throw new Error("NETWORK_ERROR");
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("NETWORK_ERROR");
  const data = await res.json();
  return { username: data.username, courseCode: data.courseCode };
}

export async function registerUser(walletAddress, courseCode, username) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, courseCode, username }),
    });
  } catch {
    throw new Error("NETWORK_ERROR");
  }
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Registration failed");
  }
  return await res.json();
}

export async function getSavedNotes(walletAddress) {
  let res;
  try {
    res = await fetch(
      `${API_URL}/api/saved/${encodeURIComponent(walletAddress)}`,
    );
  } catch {
    throw new Error("NETWORK_ERROR");
  }
  if (!res.ok) throw new Error("Failed to fetch saved notes");
  return await res.json();
}

export async function saveNote(walletAddress, note) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/saved`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress,
        ipfsHash: note.ipfs_pin_hash,
        title: note.metadata?.keyvalues?.title || note.metadata?.name,
        subject: note.metadata?.keyvalues?.subject || "",
        description: note.metadata?.keyvalues?.description || "",
        uploader: note.metadata?.keyvalues?.uploader || "Anonymous",
        fileType: note.metadata?.keyvalues?.fileType || "",
        courseCode: note.metadata?.keyvalues?.courseCode || "",
      }),
    });
  } catch {
    throw new Error("NETWORK_ERROR");
  }
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to save note");
  }
  return await res.json();
}

export async function unsaveNote(walletAddress, ipfsHash) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/saved`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, ipfsHash }),
    });
  } catch {
    throw new Error("NETWORK_ERROR");
  }
  if (!res.ok) throw new Error("Failed to unsave note");
  return await res.json();
}
