import { useEffect, useState } from "react";
import { getFilesFromPinata } from "../hooks/usePinata";
import "../styles/Explore.css";
import doc from "../icons/doc.png";
import pdf from "../icons/pdf.png";
import img from "../icons/img.png";
import ppt from "../icons/ppt.png";

function Explore() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const files = await getFilesFromPinata();

        setNotes(files);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, []);

  function fileIcon(type) {
    if (!type) return "📎";
    if (type.includes("pdf")) return pdf;
    if (type.includes("image")) return img;
    if (type.includes("presentation") || type.includes("powerpoint"))
      return ppt;
    if (type.includes("word") || type.includes("document")) return doc;

    return "📎";
  }

  return (
    <div className="explore-container">
      <h1 className="explore-title">Explore Notes</h1>

      {notes.length === 0 ? (
        <p className="empty-message">No uploaded notes yet.</p>
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
