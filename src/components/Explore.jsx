import { useEffect, useState } from "react";
import { getFilesFromPinata } from "../hooks/usePinata";
import { saveNote, unsaveNote, getSavedNotes } from "../hooks/useAuth";
import "../styles/Explore.css";
import doc from "../icons/doc.png";
import pdf from "../icons/pdf.png";
import img from "../icons/img.png";
import ppt from "../icons/ppt.png";

function Explore({ courseCode, walletAddress, onNavigate }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const NOTES_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const [savedHashes, setSavedHashes] = useState(new Set());

  const totalPages = Math.ceil(notes.length / NOTES_PER_PAGE);
  const startIndex = (currentPage - 1) * NOTES_PER_PAGE;
  const currentNotes = notes.slice(startIndex, startIndex + NOTES_PER_PAGE);
  useEffect(() => {
    async function fetchFiles() {
      setCurrentPage(1);
      if (!courseCode || !walletAddress) {
        setNotes([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [files, saved] = await Promise.all([
          getFilesFromPinata(courseCode),
          getSavedNotes(walletAddress),
        ]);
        setNotes(files);
        setSavedHashes(new Set(saved.map((n) => n.ipfsHash)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, [courseCode, walletAddress]);
  async function toggleSave(note) {
    if (!walletAddress) return;
    const hash = note.ipfs_pin_hash;
    const isSaved = savedHashes.has(hash);

    setSavedHashes((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(hash) : next.add(hash);
      return next;
    });

    try {
      if (isSaved) {
        await unsaveNote(walletAddress, hash);
      } else {
        await saveNote(walletAddress, note);
      }
    } catch (err) {
      console.error("Toggle save failed:", err.message);
      setSavedHashes((prev) => {
        const next = new Set(prev);
        isSaved ? next.add(hash) : next.delete(hash);
        return next;
      });
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

  //wallet wapa na connect sa lace
  if (!walletAddress) {
    return (
      <div className="explore-container">
        <div className="explore-hero">
          <h1 className="explore-title">Explore Notes</h1>
          <p className="explore-subtitle">
            Find the notes that you are looking for in your course!
          </p>
        </div>
        <div className="empty-card">
          <div className="empty-icon-ring">
            <span className="empty-icon">🔌</span>
          </div>
          <h2 className="empty-title">Wallet Not Connected</h2>
          <p className="empty-desc">
            Connect your Lace wallet to access course materials for your
            program.
          </p>
        </div>
      </div>
    );
  }

  // connected sa lace pero walay sulod ang files
  if (!courseCode) {
    return (
      <div className="explore-container">
        <div className="explore-hero">
          <h1 className="explore-title">Explore Notes</h1>
          <p className="explore-subtitle">
            Discover and share academic materials on the blockchain.
          </p>
        </div>
        <div className="empty-card">
          <div className="empty-icon-ring">
            <span className="empty-icon">📋</span>
          </div>
          <h2 className="empty-title">Select Your Course</h2>
          <p className="empty-desc">
            Please select your course code to access materials for your program.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="explore-container">
        <div className="explore-hero">
          <h1 className="explore-title">Explore Notes</h1>
          <p className="explore-subtitle">
            Discover and share academic materials on the blockchain.
          </p>
        </div>
        <div className="empty-card">
          <div className="empty-icon-ring loading-ring">
            <span className="empty-icon">📂</span>
          </div>
          <h2 className="empty-title">Loading Notes</h2>
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
      <div className="explore-container">
        <div className="explore-hero">
          <h1 className="explore-title">Explore Notes</h1>
          <p className="explore-subtitle">
            Discover and share academic materials on the blockchain.
          </p>
        </div>
        <div className="empty-card">
          <div className="empty-icon-ring">
            <span className="empty-icon">📂</span>
          </div>
          <h2 className="empty-title">No Notes Yet for {courseCode}</h2>
          <p className="empty-desc">
            Be the first to share your academic materials with your course.
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

  return (
    <div className="explore-container">
      <div className="explore-hero">
        <div className="explore-header-row">
          <h1 className="explore-title">Explore Notes</h1>
          <div className="course-code-glow">
            <span className="course-badge">{courseCode}</span>
          </div>
        </div>
        <p className="explore-subtitle">
          {notes.length} note{notes.length !== 1 ? "s" : ""} available in your
          course.
        </p>
      </div>

      <div className="notes-grid-container">
        <div className="notes-grid">
          {currentNotes.map((note) => {
            const icon = fileIcon(note.metadata?.keyvalues?.fileType);
            const title =
              note.metadata?.keyvalues?.title || note.metadata?.name;
            const subject = note.metadata?.keyvalues?.subject;
            const description = note.metadata?.keyvalues?.description;
            const uploader = note.metadata?.keyvalues?.uploader;

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
                    {subject && <span className="note-subject">{subject}</span>}
                  </div>

                  <button
                    className={`save-btn ${savedHashes.has(note.ipfs_pin_hash) ? "save-btn-active" : ""}`}
                    onClick={() => toggleSave(note)}
                    title={
                      savedHashes.has(note.ipfs_pin_hash)
                        ? "Remove from My Notes"
                        : "Save to My Notes"
                    }
                  >
                    {savedHashes.has(note.ipfs_pin_hash) ? "🗂️" : "📁"}
                  </button>
                </div>

                {description && (
                  <p className="note-description">{description}</p>
                )}

                <div className="note-footer">
                  {uploader && (
                    <span className="note-uploader" title={uploader}>
                      👤 {uploader}
                    </span>
                  )}
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
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>

            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    className={`page-num ${currentPage === num ? "page-active" : ""}`}
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </button>
                ),
              )}
            </div>

            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;
