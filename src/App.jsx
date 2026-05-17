import { useState, useEffect } from "react";
import { useWallet } from "./hooks/useWallet";
import { getUserProfile } from "./hooks/usePinata"; // ← only this, remove getUserCourseCode
import Header from "./components/Header";
import Transaction from "./components/Transaction";
import Upload from "./components/Upload";
import Explore from "./components/Explore";
import CourseCodeModal from "./components/CourseCodeModal";
import "./styles/Header.css";
import "./styles/Transaction.css";

function App() {
  const wallet = useWallet();
  const [username, setUsername] = useState(null);
  const [showTx, setShowTx] = useState(false);
  const [page, setPage] = useState("explore");
  const [courseCode, setCourseCode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  useEffect(() => {
    async function checkProfile() {
      if (!wallet.account) {
        setCourseCode(null);
        setUsername(null);
        setShowModal(false);
        return;
      }

      setCheckingCode(true);
      try {
        const profile = await getUserProfile(wallet.account);
        if (profile) {
          setCourseCode(profile.courseCode);
          setUsername(profile.username);
          setShowModal(false);
        } else {
          setShowModal(true);
        }
      } catch (err) {
        console.error("Failed to check profile:", err);
        // prevents to show the modal if the user is already authorized
        setShowModal(false);
      } finally {
        setCheckingCode(false);
      }
    }

    checkProfile();
  }, [wallet.account]);

  function handleCourseCodeSuccess(code, uname) {
    setCourseCode(code);
    setUsername(uname);
    setShowModal(false);
  }

  return (
    <div className="app">
      <Header onSendETH={() => setShowTx(true)} onNavigate={setPage} />

      <main className="main">
        {checkingCode && (
          <p style={{ color: "white", padding: "2rem", textAlign: "center" }}>
            Loading your profile...
          </p>
        )}

        {!checkingCode && page === "explore" && (
          <Explore
            courseCode={courseCode}
            walletAddress={wallet.account}
            onNavigate={setPage}
          />
        )}

        {!checkingCode && page === "upload" && (
          <Upload
            walletApi={wallet.api}
            walletAddress={wallet.account}
            courseCode={courseCode}
            username={username}
          />
        )}
      </main>

      {showModal && wallet.account && (
        <CourseCodeModal
          walletAddress={wallet.account}
          onSuccess={handleCourseCodeSuccess}
        />
      )}

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
