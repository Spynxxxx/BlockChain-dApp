// App.jsx
import { useState, useEffect } from "react";
import { useWallet } from "./hooks/useWallet";
import { getUserCourseCode } from "./hooks/usePinata";
import Header from "./components/Header";
import Transaction from "./components/Transaction";
import Upload from "./components/Upload";
import Explore from "./components/Explore";
import CourseCodeModal from "./components/CourseCodeModal";
import "./styles/Header.css";
import "./styles/Transaction.css";

function App() {
  const wallet = useWallet();
  const [showTx, setShowTx] = useState(false);
  const [page, setPage] = useState("explore");
  const [courseCode, setCourseCode] = useState(null); // the user's course code
  const [showModal, setShowModal] = useState(false); // show course code modal
  const [checkingCode, setCheckingCode] = useState(false);

  // ── When wallet connects, check if user already has a course code ──────────
  useEffect(() => {
    async function checkCourseCode() {
      if (!wallet.account) {
        // wallet disconnected — reset course code
        setCourseCode(null);
        setShowModal(false);
        return;
      }

      setCheckingCode(true);
      try {
        const code = await getUserCourseCode(wallet.account);
        if (code) {
          // already registered — load their code silently
          setCourseCode(code);
          setShowModal(false);
        } else {
          // first time — show the modal
          setShowModal(true);
        }
      } catch (err) {
        console.error("Failed to check course code:", err);
        // if check fails, still show modal to be safe
        setShowModal(true);
      } finally {
        setCheckingCode(false);
      }
    }

    checkCourseCode();
  }, [wallet.account]); // runs every time wallet connects/disconnects

  // ── Called by CourseCodeModal after user confirms their code ───────────────
  function handleCourseCodeSuccess(code) {
    setCourseCode(code);
    setShowModal(false);
  }

  return (
    <div className="app">
      <Header onSendETH={() => setShowTx(true)} onNavigate={setPage} />

      <main className="main">
        {/* Show a loading state while checking Pinata for course code */}
        {checkingCode && (
          <p style={{ color: "white", padding: "2rem", textAlign: "center" }}>
            Loading your profile...
          </p>
        )}

        {!checkingCode && page === "explore" && (
          <Explore courseCode={courseCode} walletAddress={wallet.account} />
        )}

        {!checkingCode && page === "upload" && (
          <Upload
            walletApi={wallet.api}
            walletAddress={wallet.account}
            courseCode={courseCode}
          />
        )}
      </main>

      {/* Course code modal — shown after wallet connect if not registered */}
      {showModal && wallet.account && (
        <CourseCodeModal
          walletAddress={wallet.account}
          onSuccess={handleCourseCodeSuccess}
        />
      )}

      {/* Send ADA modal */}
      {showTx && (
        <div className="modal-backdrop" onClick={() => setShowTx(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTx(false)}>
              ✕
            </button>
            <Transaction />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
