import { useState } from "react";
import { registerUser } from "../hooks/usePinata";
import "../styles/CourseCodeModal.css";

const VALID_CODES = ["CIT-CS", "CIT-CE", "CIT-IT", "CIT-NURSING"];

function CourseCodeModal({ walletAddress, onSuccess }) {
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleConfirm() {
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }
    if (!selected) {
      setError("Please select a course code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerUser(walletAddress, selected, username.trim());
      onSuccess(selected, username.trim()); // ← pass both back to App.jsx
    } catch (err) {
      console.error(err);
      setError("Failed to save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-box course-modal">
        <div className="course-modal-header">
          <h2>Set Up Your Profile</h2>
          <p>
            Choose a username and your course code. This can only be set once.
          </p>
        </div>

        <div className="course-modal-username">
          <label className="formTitle">Username</label>
          <input
            className="textField"
            type="text"
            placeholder="e.g. John Doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            maxLength={32}
          />
        </div>

        {/* Course code selection */}
        <label
          className="formTitle"
          style={{ marginBottom: "0.5rem", display: "block" }}
        >
          Course Code
        </label>
        <div className="course-code-grid">
          {VALID_CODES.map((code) => (
            <button
              key={code}
              className={`course-code-btn ${selected === code ? "selected" : ""}`}
              onClick={() => setSelected(code)}
              disabled={loading}
            >
              {code}
            </button>
          ))}
        </div>

        {error && <p className="course-modal-error">{error}</p>}

        <div className="course-modal-wallet">
          <small>
            Wallet: {walletAddress?.slice(0, 12)}...{walletAddress?.slice(-6)}
          </small>
        </div>

        <button
          className="btn-upload-submit"
          onClick={handleConfirm}
          disabled={loading || !selected || !username.trim()}
        >
          {loading ? "Saving..." : "Confirm Profile"}
        </button>
      </div>
    </div>
  );
}

export default CourseCodeModal;
