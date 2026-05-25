import { useState, useRef } from "react";
import { uploadToIPFS } from "../hooks/usePinata";
import { sendUploadFee } from "../hooks/useCardano";
import "../styles/Upload.css";

function Upload({ walletApi, walletAddress, courseCode, username }) {
  const [anonymous, setAnonymous] = useState(false);
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
    if (!walletApi) {
      setStatus({ type: "error", msg: "Wallet not connected." });
      return;
    }

    setLoading(true);
    setIpfsLink(null);

    try {
      setStatus({
        type: "info",
        msg: "💳 Please approve 1 ADA transaction in Lace...",
      });
      const txHash = await sendUploadFee(walletApi, {
        title: title.trim(),
        subject: subject.trim(),
        uploader: anonymous
          ? "Anonymous"
          : username || walletAddress || "Anonymous",
        courseCode: courseCode,
      });

      setStatus({
        type: "info",
        msg: `✅ Transaction confirmed! Now uploading to IPFS...`,
      });

      const cid = await uploadToIPFS(file, {
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        uploader: anonymous
          ? "Anonymous"
          : username || walletAddress || "Anonymous",
        uploaderRef: username || walletAddress,
        courseCode: courseCode,
      });

      const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

      setIpfsLink(url);
      setStatus({
        type: "success",
        msg: `🎉 Upload successful! Tx: ${txHash.slice(0, 12)}...`,
      });
      setFile(null);
      setTitle("");
      setSubject("");
      setDescription("");
    } catch (err) {
      console.error(err);
      if (
        err.message?.toLowerCase().includes("declined") ||
        err.message?.toLowerCase().includes("user")
      ) {
        setStatus({
          type: "error",
          msg: "Transaction cancelled. File was not uploaded.",
        });
      } else {
        setStatus({ type: "error", msg: err.message || "Upload failed." });
      }
    } finally {
      setLoading(false);
    }
  }

  if (!walletAddress) {
    return (
      <div className="page-container">
        <div className="upload-wrapper">
          <div className="page-header">
            <h1 className="page-title">Upload Notes</h1>
          </div>
          <p className="wallet-warning">
            ⚠️ Connect your wallet before uploading.
          </p>
        </div>
      </div>
    );
  }

  if (!courseCode) {
    return (
      <div className="page-container">
        <div className="upload-wrapper">
          <div className="page-header">
            <h1 className="page-title">Upload Notes</h1>
          </div>
          <p className="wallet-warning">
            ⚠️ Please select your course code first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="upload-wrapper">
        <div className="page-header">
          <h1 className="page-title">Upload Notes</h1>
          <p className="page-subtitle">
            Uploading to: <strong>{courseCode}</strong>
          </p>
        </div>

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
            <div
              className="drop-prompt"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => !file && fileInputRef.current.click()}
            >
              <p className="drop-hint">
                Drop your file here or click to browse
              </p>
              <span className="drop-hint">
                PDF, Images, PPT, Word — max 50MB
              </span>
            </div>
          )}
        </div>

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
        {status && (
          <div className={`upload-status ${status.type}`}>{status.msg}</div>
        )}
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
        <div className="anonymous-toggle">
          <label className="anonymous-label">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              disabled={loading}
            />
            <span>Upload anonymously</span>
          </label>
          {!anonymous && username && (
            <span className="uploading-as">
              Uploading as: <strong>{username}</strong>
            </span>
          )}
        </div>
        <div className="button-wrapper">
          {file && (
            <button
              className="btn-upload-submit"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "Processing..." : "Upload to IPFS (1 ADA fee)"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Upload;
