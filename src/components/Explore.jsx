import { useEffect, useState } from "react";
import { getFilesFromPinata } from "../hooks/usePinata";
import "../styles/Explore.css";
import doc from "../icons/doc.png";
import pdf from "../icons/pdf.png";
import img from "../icons/img.png";
import ppt from "../icons/ppt.png";

function Explore({ courseCode, walletAddress }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      setLoading(true);
      try {
        const files = await getFilesFromPinata(courseCode);
        setNotes(files);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, [courseCode]);

  function fileIcon(type) {
    if (!type) return "📎";
    if (type.includes("pdf")) return pdf;
    if (type.includes("image")) return img;
    if (type.includes("presentation") || type.includes("powerpoint"))
      return ppt;
    if (type.includes("word") || type.includes("document")) return doc;
    return "📎";
  }

  if (!walletAddress) {
    return (
      <div className="explore-container">
        <h1 className="explore-title">Explore Notes</h1>
        <p className="empty-message">
          🔌 Connect your wallet to view notes for your course.
        </p>
      </div>
    );
  }
  if (!courseCode) {
    return (
      <div className="explore-container">
        <h1 className="explore-title">Explore Notes</h1>
        <p className="empty-message">
          📋 Please select your course code to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="explore-container">
      <div className="explore-header-row">
        <h1 className="explore-title">Explore Notes</h1>
        <span className="course-badge">{courseCode}</span>
      </div>

      {loading ? (
        <p className="empty-message">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="empty-message">No uploaded notes yet for {courseCode}.</p>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div className="note-card" key={note.ipfs_pin_hash}>
              <div className="note-header">
                <img
                  className="note-icon"
                  src={fileIcon(note.metadata?.keyvalues?.fileType)}
                  alt="file icon"
                />
                <div>
                  <h3>
                    {note.metadata?.keyvalues?.title || note.metadata?.name}
                  </h3>
                  <p>{note.metadata?.keyvalues?.subject}</p>
                </div>
              </div>

              <p className="note-description">
                {note.metadata?.keyvalues?.description}
              </p>

              <div className="note-footer">
                <small>
                  {note.metadata?.keyvalues?.uploader?.slice(0, 12)}...
                </small>
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
          ))}
        </div>
      )}
    </div>
  );
}

export default Explore;
