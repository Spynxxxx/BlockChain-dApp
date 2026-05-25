import { useEffect, useState } from "react";
import { getMyUploads, unpinFile } from "../hooks/usePinata";
import "../styles/MyUploads.css";
import doc from "../icons/doc.png";
import pdf from "../icons/pdf.png";
import img from "../icons/img.png";
import ppt from "../icons/ppt.png";

function MyUploads({ walletAddress, username, onNavigate }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  useEffect(() => {
    async function fetchUploads() {
      if (!walletAddress || !username) {
        setNotes([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const files = await getMyUploads(username);
        setNotes(files);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUploads();
  }, [walletAddress, username]);

  function fileIcon(type) {
    if (!type) return null;
    if (type.includes("pdf")) return pdf;
    if (type.includes("image")) return img;
    if (type.includes("presentation") || type.includes("powerpoint"))
      return ppt;
    if (type.includes("word") || type.includes("document")) return doc;
    return null;
  }

  function handleDeleteClick(note) {
    setSelectedNote(note);
    setShowConfirm(true);
  }

  async function handleDeleteConfirm() {
    if (!selectedNote) return;
    setDeleting(true);
    try {
      await unpinFile(selectedNote.ipfs_pin_hash);
      setNotes((prev) =>
        prev.filter((n) => n.ipfs_pin_hash !== selectedNote.ipfs_pin_hash),
      );
      setShowConfirm(false);
      setSelectedNote(null);
    } catch (err) {
      alert("❌ Failed to delete file. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  function handleDeleteCancel() {
    setShowConfirm(false);
    setSelectedNote(null);
  }

  if (!walletAddress) {
    return (
      <div className="myuploads-container">
        <div className="explore-hero">
          <h1 className="explore-title">My Uploads</h1>
          <p className="explore-subtitle">
            Files you have uploaded to the platform.
          </p>
        </div>
        <div className="empty-card">
          <div className="empty-icon-ring">
            <span className="empty-icon">🔌</span>
          </div>
          <h2 className="empty-title">Wallet Not Connected</h2>
          <p className="empty-desc">
            Connect your Lace wallet to view your uploads.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="myuploads-container">
        <div className="explore-hero">
          <h1 className="explore-title">My Uploads</h1>
          <p className="explore-subtitle">
            Files you have uploaded to the platform.
          </p>
        </div>
        <div className="empty-card">
          <div className="empty-icon-ring loading-ring">
            <span className="empty-icon">📤</span>
          </div>
          <h2 className="empty-title">Loading Your Uploads</h2>
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
      <div className="myuploads-container">
        <div className="explore-hero">
          <h1 className="explore-title">My Uploads</h1>
          <p className="explore-subtitle">
            Files you have uploaded to the platform.
          </p>
        </div>
        <div className="empty-card">
          <div className="empty-icon-ring">
            <span className="empty-icon">📤</span>
          </div>
          <h2 className="empty-title">No Uploads Yet</h2>
          <p className="empty-desc">
            You haven't uploaded any files yet. Start sharing your notes!
          </p>
          {onNavigate && (
            <button
              className="empty-upload-btn"
              onClick={() => onNavigate("upload")}
            >
              Upload a Note →
            </button>
          )}
        </div>
      </div>
    );
  }
  const filteredNotes = notes.filter((note) => {
    const q = submittedSearch.toLowerCase();
    if (!q) return true;
    const title = note.metadata?.keyvalues?.title?.toLowerCase() || "";
    const subject = note.metadata?.keyvalues?.subject?.toLowerCase() || "";
    return title.includes(q) || subject.includes(q);
  });
  function handleSearch() {
    setSubmittedSearch(search);
  }
  return (
    <div className="myuploads-container">
      <div className="explore-hero">
        <div className="explore-header-row">
          <h1 className="explore-title">My Uploads</h1>
          <span className="course-badge">
            {filteredNotes.length} file{filteredNotes.length !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="explore-subtitle">
          These are your uploads, you can also see the files that you have
          uploaded as Anonymous.
          <br />
          You can also delete you uploaded Files!
        </p>
      </div>
      {notes.length > 0 && (
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="search-input"
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => {
                setSearch("");
                setSubmittedSearch(""); // ← clears results too
              }}
            >
              ✕
            </button>
          )}
          <button className="search-submit-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      )}

      {submittedSearch && (
        <p className="search-results-count">
          {filteredNotes.length} result{filteredNotes.length !== 1 ? "s" : ""}{" "}
          for "{submittedSearch}"
        </p>
      )}

      {/* ← wrap grid and no-results in a conditional */}
      {submittedSearch && filteredNotes.length === 0 ? (
        <div className="empty-card">
          <div className="empty-icon-ring">
            <span className="empty-icon">🔎</span>
          </div>
          <h2 className="empty-title">No Results Found</h2>
          <p className="empty-desc">
            No files matched "<strong>{submittedSearch}</strong>". Try a
            different title or subject.
          </p>
          <button
            className="empty-upload-btn"
            onClick={() => {
              setSearch("");
              setSubmittedSearch("");
            }}
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="notes-grid-container">
          <div className="notes-grid">
            {filteredNotes.map((note) => {
              // ... your existing card code stays exactly the same
              const icon = fileIcon(note.metadata?.keyvalues?.fileType);
              const title =
                note.metadata?.keyvalues?.title || note.metadata?.name;
              const subject = note.metadata?.keyvalues?.subject;
              const description = note.metadata?.keyvalues?.description;

              return (
                <div className="note-card" key={note.ipfs_pin_hash}>
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
                      <h3 className="note-title">{title}</h3>
                      {subject && (
                        <span className="note-subject">{subject}</span>
                      )}
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteClick(note)}
                      title="Delete this file"
                    >
                      🗑️
                    </button>
                  </div>

                  {description && (
                    <p className="note-description">{description}</p>
                  )}

                  <div className="note-footer">
                    <span className="note-uploader">
                      👤{" "}
                      {note.metadata?.keyvalues?.uploader === "Anonymous"
                        ? `${username} ( Anonymous )`
                        : username}
                    </span>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${note.ipfs_pin_hash}`}
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
      )}

      {showConfirm && (
        <div className="modal-backdrop" onClick={handleDeleteCancel}>
          <div
            className="modal-box course-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="course-modal-header">
              <h2>Delete File?</h2>
              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {selectedNote?.metadata?.keyvalues?.title || "this file"}
                </strong>
                ? This will remove it from IPFS and everyone's Explore page
                permanently.
              </p>
            </div>

            <div className="logout-buttons">
              <button
                className="logout-yes"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                className="logout-no"
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyUploads;
