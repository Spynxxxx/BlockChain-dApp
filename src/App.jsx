import { useState } from "react";
import Header from "./components/Header";
import Transaction from "./components/Transaction";
import "./styles/Header.css";
import "./styles/Transaction.css";

function App() {
  const [showTx, setShowTx] = useState(false);

  return (
    <div className="app">
      <Header onSendETH={() => setShowTx(true)} />
      <main className="main">
        <div className="hero-badge"> BaiChain Powered</div>
        <h1 className="main-title">Welcome to SharEthNotes</h1>
        <p className="main-sub">
          A decentralized platform to share study notes on the blockchain. Your
          notes, permanently yours. <br /> To start view uploaded files click
          explore.
        </p>
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
