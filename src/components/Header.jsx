import { useWallet } from "../hooks/useWallet";

function Header({ onSendETH, onNavigate }) {
  const { account, balance, connecting, error, connect, disconnect } =
    useWallet();

  function shortAddress(addr) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  return (
    <header className="header">
      <div className="header-logo">
        <span className="logo-text">SharEthNotes</span>
      </div>

      <nav className="header-nav">
        <a href="#" onClick={() => onNavigate("explore")}>
          Explore
        </a>
        <a href="#">My Notes</a>
        <a href="#" onClick={() => onNavigate("upload")}>
          Upload
        </a>
      </nav>

      <div className="header-wallet">
        {error && <span className="wallet-error">{error}</span>}

        {account ? (
          <div className="wallet-connected">
            <div className="wallet-info">
              <span className="wallet-balance">{balance} ADA</span>
              <span className="wallet-address">{shortAddress(account)}</span>
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
    </header>
  );
}

export default Header;
