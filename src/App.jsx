import { useState } from "react";
import { useWallet } from "./hooks/useWallet";
import Header from "./components/Header";
import Transaction from "./components/Transaction";
import Upload from "./components/Upload";
import "./styles/Header.css";
import "./styles/Transaction.css";

function App() {
  const wallet = useWallet();
  const [showTx, setShowTx] = useState(false);
  const [page, setPage] = useState("explore");
  return (
    <div className="app">
      <Header onSendETH={() => setShowTx(true)} onNavigate={setPage} />
      <main className="main">
        {page === "explore" && (
          <>
            <div className="hero-badge"> BaiChain Powered</div>
            <h1 className="main-title">Welcome to SharEthNotes</h1>
            <p className="main-sub">
              A decentralized platform to share study notes on the blockchain.
              Your notes, permanently yours. <br /> To start view uploaded files
              click explore.
            </p>
          </>
        )}
        {page === "upload" && (
          <Upload walletApi={wallet.api} walletAddress={wallet.account} />
        )}
      </main>

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
