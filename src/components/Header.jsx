import { useState } from "react";
import { useWallet } from "../hooks/useWallet";

function Header({ onSendETH, onNavigate }) {
  const { account, balance, connecting, error, connect, disconnect } =
    useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  function shortAddress(addr) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  function handleNavigate(page) {
    onNavigate(page);
    setMenuOpen(false);
  }

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-logo">
          <span className="logo-text">SharEthNotes</span>
        </div>

        <nav className="header-nav desktop-nav">
          <a href="#" onClick={() => handleNavigate("explore")}>
            Explore
          </a>
          <a href="#">My Notes</a>
          <a href="#" onClick={() => handleNavigate("upload")}>
            Upload
          </a>
        </nav>

        <div className="header-right">
          <div className="header-wallet">
            {error && <span className="wallet-error">{error}</span>}

            {account ? (
              <div className="wallet-connected">
                <div className="wallet-info">
                  <span className="wallet-balance">{balance} ADA</span>
                  <span className="wallet-address">
                    {shortAddress(account)}
                  </span>
                </div>
                <button className="btn-send-header" onClick={onSendETH}>
                  💸 Send
                </button>
                <button className="btn-disconnect" onClick={disconnect}>
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                className="btn-connect"
                onClick={connect}
                disabled={connecting}
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>

          <button
            className="hamburger"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </div>

      <nav className={`mobile-nav ${menuOpen ? "mobile-nav-open" : ""}`}>
        <a href="#" onClick={() => handleNavigate("explore")}>
          Explore
        </a>
        <a href="#">My Notes</a>
        <a href="#" onClick={() => handleNavigate("upload")}>
          Upload
        </a>
      </nav>
    </header>
  );
}

export default Header;
