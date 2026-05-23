import { useState } from "react";
import LogoutModal from "./LogoutModal";
function Header({ onSendETH, onNavigate, wallet, currentPage }) {
  const { account, balance, connecting, error, connect, disconnect } = wallet;
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  function shortAddress(addr) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  function handleNavigate(page) {
    onNavigate(page);
    setMenuOpen(false);
  }
  const handleDisconnectClick = () => {
    setShowLogoutModal(true);
  };
  const handleDisconnectYes = () => {
    disconnect();
    setShowLogoutModal(false);
  };
  const handleDisconnectNo = () => {
    setShowLogoutModal(false);
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-logo">
          <div className="logo-hover">
            <span className="logo-text">SharEth</span>
          </div>
        </div>

        <nav className="header-nav desktop-nav">
          <a
            href="#"
            onClick={() => handleNavigate("explore")}
            className={currentPage === "explore" ? "active" : ""}
          >
            Explore
          </a>
          <a
            href="#"
            onClick={() => handleNavigate("mynotes")}
            className={currentPage === "mynotes" ? "active" : ""}
          >
            My Notes
          </a>
          <a
            href="#"
            onClick={() => handleNavigate("myuploads")}
            className={currentPage === "myuploads" ? "active" : ""}
          >
            My Uploads
          </a>
          <a
            href="#"
            onClick={() => handleNavigate("upload")}
            className={currentPage === "upload" ? "active" : ""}
          >
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
                <button
                  className="btn-disconnect"
                  onClick={handleDisconnectClick}
                >
                  Disconnect
                </button>
                {showLogoutModal && (
                  <LogoutModal
                    onConfirm={handleDisconnectYes}
                    onCancel={handleDisconnectNo}
                  />
                )}
              </div>
            ) : (
              <div className="btn-connect-glow">
                <button
                  className="btn-connect"
                  onClick={connect}
                  disabled={connecting}
                >
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </button>
              </div>
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
        <a
          href="#"
          onClick={() => handleNavigate("explore")}
          className={currentPage === "explore" ? "active" : ""}
        >
          Explore
        </a>
        <a
          href="#"
          onClick={() => handleNavigate("mynotes")}
          className={currentPage === "mynotes" ? "active" : ""}
        >
          My Notes
        </a>
        <a
          href="#"
          onClick={() => handleNavigate("myuploads")}
          className={currentPage === "myuploads" ? "active" : ""}
        >
          My Uploads
        </a>
        <a
          href="#"
          onClick={() => handleNavigate("upload")}
          className={currentPage === "upload" ? "active" : ""}
        >
          Upload
        </a>
      </nav>
    </header>
  );
}

export default Header;
