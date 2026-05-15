// CourseCodeModal.jsx
// Appears after wallet connect if the user has no saved course code on Pinata.

import { useState } from "react";
import { registerUser } from "../hooks/usePinata";

const VALID_CODES = ["CIT-CS", "CIT-CE", "CIT-IT", "CIT-NURSING"];

function CourseCodeModal({ walletAddress, onSuccess }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  async function handleConfirm() {
    if (!selected) {
      setError("Please select a course code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await registerUser(walletAddress, selected);
      onSuccess(selected); // tell App.jsx the code is confirmed
    } catch (err) {
      console.error(err);
      setError("Failed to save your course code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-box course-modal">
        <div className="course-modal-header">
          <h2>Select Your Course</h2>
          <p>
            Choose your course code. This determines which notes you can see
            and upload. You can only set this once.
          </p>
        </div>

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
          disabled={loading || !selected}
        >
          {loading ? "Saving..." : "Confirm Course Code"}
        </button>
      </div>
    </div>
  );
}

export default CourseCodeModal;
