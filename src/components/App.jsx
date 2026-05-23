import { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { getUserProfile } from "../hooks/useAuth";
import Header from "./Header";
import GridBackground from "./GridBackground";
import Transaction from "./Transaction";
import Upload from "./Upload";
import Explore from "./Explore";
import MyNotes from "./MyNotes";
import CourseCodeModal from "./CourseCodeModal";
import "../styles/Header.css";
import "../styles/Transaction.css";
import MyUploads from "./MyUploads";

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
        console.error("Failed to check profile:", err.message);
        if (err.message === "NETWORK_ERROR") {
          setShowModal(false);
          alert(
            "⚠️ Cannot connect to server. Make sure your backend is running on port 5000.",
          );
        } else {
          setShowModal(true);
        }
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
      <Header
        onSendETH={() => setShowTx(true)}
        onNavigate={setPage}
        wallet={wallet}
        username={username}
      />
      <GridBackground
        username={username}
        wallet={wallet}
        courseCode={courseCode}
      />

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

        {!checkingCode && page === "mynotes" && (
          <MyNotes walletAddress={wallet.account} onNavigate={setPage} />
        )}
        {!checkingCode && page === "myuploads" && (
          <MyUploads
            walletAddress={wallet.account}
            username={username}
            onNavigate={setPage}
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
