// Upload.jsx
import { useState, useRef } from "react";
import { uploadToIPFS } from "../hooks/usePinata";
import "../styles/Upload.css";

function Upload({ walletApi, walletAddress }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ipfsLink, setIpfsLink] = useState(null);
  const fileInputRef = useRef();

  function pickFile(f) {
    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/gif",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(f.type)) {
      setStatus({
        type: "error",
        msg: "Only PDF, images, PPT, or Word files allowed.",
      });
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setStatus({ type: "error", msg: "File must be under 50MB." });
      return;
    }
    setFile(f);
    setStatus(null);
    setIpfsLink(null);
  }

  function onDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
  }

  function fileIcon(type) {
    if (!type) return "📎";
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("presentation") || type.includes("powerpoint"))
      return "📊";
    if (type.includes("word") || type.includes("document")) return "📝";
    return "📎";
  }

  async function handleUpload() {
    if (!file) {
      setStatus({ type: "error", msg: "Please select a file." });
      return;
    }
    if (!title.trim()) {
      setStatus({ type: "error", msg: "Title is required." });
      return;
    }
    if (!subject.trim()) {
      setStatus({ type: "error", msg: "Subject is required." });
      return;
    }

    setLoading(true);
    setIpfsLink(null);

    try {
      // Step 1 — upload file to IPFS
      setStatus({ type: "info", msg: "📤 Uploading to IPFS..." });
      const cid = await uploadToIPFS(file);
      const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
      console.log("CID:", cid);
      console.log("URL:", url);

      // Step 2 — save record to localStorage
      const record = {
        cid,
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        uploader: walletAddress || "anonymous",
        fileName: file.name,
        fileType: file.type,
        timestamp: new Date().toISOString(),
      };

      const existing = JSON.parse(
        localStorage.getItem("shareethnotes") || "[]",
      );
      existing.unshift(record);
      localStorage.setItem("shareethnotes", JSON.stringify(existing));

      setIpfsLink(url);
      setStatus({
        type: "success",
        msg: "🎉 Upload successful! Your note is now on IPFS.",
      });
      setFile(null);
      setTitle("");
      setSubject("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: err.message || "Upload failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="upload-wrapper">
        <div className="page-header">
          <h1 className="page-title">Upload Notes</h1>
          <p className="page-subtitle"></p>
        </div>

        {/* Drop zone */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.gif,.ppt,.pptx,.doc,.docx"
            style={{ display: "none" }}
            onChange={(e) => e.target.files[0] && pickFile(e.target.files[0])}
          />
          {file ? (
            <div className="file-preview">
              <span className="file-icon">{fileIcon(file.type)}</span>
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                className="file-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="drop-prompt">
              <p>Drop your file here or click to browse</p>
              <span className="drop-hint">
                PDF, Images, PPT, Word — max 50MB
              </span>
            </div>
          )}
        </div>

        {/* Form fields */}
        <div className="upload-form">
          <div className="form-row">
            <div className="form-field">
              <label className="formTitle">Title:</label>
              <input
                className="textField"
                type="text"
                placeholder="Theory of Computation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                maxLength={64}
              />
            </div>
            <div className="form-field">
              <label className="formTitle">Subject / Course:</label>
              <input
                className="textField"
                type="text"
                placeholder="e.g. Automata"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
                maxLength={64}
              />
            </div>
          </div>

          <div className="form-field full-width">
            <label className="formTitle">Description:</label>
            <textarea
              className="textField"
              placeholder="Brief description of what's in this file…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
              maxLength={64}
            />
          </div>
        </div>

        {/* Status message */}
        {status && (
          <div className={`upload-status ${status.type}`}>{status.msg}</div>
        )}

        {/* IPFS link after success */}
        {ipfsLink && (
          <a
            href={ipfsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ipfs-success-link"
          >
            🔗 View your file on IPFS →
          </a>
        )}
        {!walletAddress && (
          <p className="wallet-warning">
            ⚠️ Connect your wallet before uploading so your note is linked to
            your address.
          </p>
        )}

        <button
          className={`drop-zone ${file ? "has-file" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => !file && fileInputRef.current.click()}
        >
          Upload File
        </button>

        {/* Submit button */}
        <button
          className="btn-upload-submit"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? "Uploading..." : "Upload to IPFS"}
        </button>
      </div>
    </div>
  );
}

export default Upload;
