import { useEffect, useState } from "react";
import { getSavedNotes, unsaveNote } from "../hooks/useAuth";
import "../styles/MyNotes.css";
import doc from "../icons/doc.png";
import pdf from "../icons/pdf.png";
import img from "../icons/img.png";
import ppt from "../icons/ppt.png";

function MyNotes({ walletAddress, onNavigate }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      if (!walletAddress) {
        setNotes([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const saved = await getSavedNotes(walletAddress);
        setNotes(saved);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, [walletAddress]);

  async function handleUnsave(ipfsHash) {
    try {
      await unsaveNote(walletAddress, ipfsHash);
      setNotes((prev) => prev.filter((n) => n.ipfsHash !== ipfsHash));
    } catch (err) {
      console.error("Failed to unsave:", err.message);
    }
  }

  function fileIcon(type) {
    if (!type) return null;
    if (type.includes("pdf")) return pdf;
    if (type.includes("image")) return img;
    if (type.includes("presentation") || type.includes("powerpoint"))
      return ppt;
    if (type.includes("word") || type.includes("document")) return doc;
    return null;
  }

  if (!walletAddress) {
    return (
      <div className="mynotes-container">
        <div className="explore-hero">
          <h1 className="explore-title">My Notes</h1>
          <p className="explore-subtitle">Your saved academic materials.</p>
        </div>
        <div className="empty-card">
          <div className="empty-icon-ring">
            <span className="empty-icon">🔌</span>
          </div>
          <h2 className="empty-title">Wallet Not Connected</h2>
          <p className="empty-desc">
            Connect your Lace wallet to view your saved notes.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mynotes-container">
        <div className="explore-hero">
          <h1 className="explore-title">My Notes</h1>
          <p className="explore-subtitle">Your saved academic materials.</p>
        </div>
        <div className="empty-card">
          <div className="empty-icon-ring loading-ring">
            <span className="empty-icon">🗂️</span>
          </div>
          <h2 className="empty-title">Loading Your Notes</h2>
          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="mynotes-container">
        <div className="explore-hero">
          <h1 className="explore-title">My Notes</h1>
          <p className="explore-subtitle">Your saved academic materials.</p>
        </div>
        <div className="empty-card">
          <div className="empty-icon-ring">
            <span className="empty-icon">📁</span>
          </div>
          <h2 className="empty-title">No Saved Notes Yet</h2>
          <p className="empty-desc">
            Browse the Explore page and click the 📁 icon to save notes here.
          </p>
          {onNavigate && (
            <button
              className="empty-upload-btn"
              onClick={() => onNavigate("explore")}
            >
              Explore Notes →
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mynotes-container">
      <div className="explore-hero">
        <div className="explore-header-row">
          <h1 className="explore-title">My Notes</h1>
          <span className="course-badge">{notes.length} saved</span>
        </div>
        <p className="explore-subtitle">
          Your personally saved academic materials.
        </p>
      </div>

      <div className="notes-grid-container">
        <div className="notes-grid">
          {notes.map((note) => {
            const icon = fileIcon(note.fileType);
            return (
              <div className="note-card" key={note.ipfsHash}>
                <div className="note-card-glow" />
                <div className="note-header">
                  <div className="note-icon-wrap">
                    {icon ? (
                      <img className="note-icon" src={icon} alt="file icon" />
                    ) : (
                      <span className="note-icon-fallback">📎</span>
                    )}
                  </div>
                  <div className="note-header-text">
                    <h3 className="note-title">{note.title || "Untitled"}</h3>
                    {note.subject && (
                      <span className="note-subject">{note.subject}</span>
                    )}
                  </div>
                  <button
                    className="save-btn save-btn-active"
                    onClick={() => handleUnsave(note.ipfsHash)}
                    title="Remove from My Notes"
                  >
                    🗂️
                  </button>
                </div>

                {note.description && (
                  <p className="note-description">{note.description}</p>
                )}

                <div className="note-footer">
                  {note.uploader && (
                    <span className="note-uploader">👤 {note.uploader}</span>
                  )}
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${note.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-btn"
                  >
                    View File
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MyNotes;
