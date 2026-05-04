import { useState } from "react";
import { ethers } from "ethers";

function Transaction() {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [loading, setLoading] = useState(false);

  async function sendTransaction() {
    if (!window.ethereum) {
      setStatus({ type: "error", msg: "MetaMask not found!" });
      return;
    }

    if (!toAddress || !amount) {
      setStatus({ type: "error", msg: "Please fill in all fields." });
      return;
    }

    if (!ethers.isAddress(toAddress)) {
      setStatus({ type: "error", msg: "Invalid wallet address." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", msg: "Waiting for confirmation..." });
    setTxHash(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amount),
      });

      setStatus({ type: "info", msg: "Transaction submitted! Waiting..." });

      await tx.wait();

      setTxHash(tx.hash);
      setStatus({ type: "success", msg: "Transaction confirmed! ✅" });

      setToAddress("");
      setAmount("");
    } catch (e) {
      setStatus({
        type: "error",
        msg: e?.message || "Transaction failed.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tx-section">
      <div className="tx-card">
        <h2 className="tx-title">💸 Send ETH</h2>
        <p className="tx-sub">Submit a transaction directly from your wallet</p>

        <div className="tx-field">
          <label>Recipient Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="tx-field">
          <label>Amount (ETH)</label>
          <input
            type="number"
            placeholder="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.001"
            disabled={loading}
          />
        </div>

        {status && (
          <div className={`tx-status ${status.type}`}>
            {status.msg}
          </div>
        )}

        {txHash && (
          <div className="tx-hash">
            <span>Tx Hash: </span>

            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {txHash.slice(0, 16)}...{txHash.slice(-8)}
            </a>
          </div>
        )}

        <button
          className="btn-send"
          onClick={sendTransaction}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Transaction"}
        </button>
      </div>
    </div>
  );
}

export default Transaction;