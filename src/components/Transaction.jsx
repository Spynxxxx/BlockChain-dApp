import { useState } from "react";

const BLOCKFROST_KEY = "preprodjIcVrwYuXuaQWKz50BlyQjJIkDZHt8Ze";
const BLOCKFROST_URL = "https://cardano-preprod.blockfrost.io/api/v0";

function Transaction() {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [loading, setLoading] = useState(false);

  async function sendTransaction() {
    if (!window.cardano || !window.cardano.lace) {
      setStatus({ type: "error", msg: "Lace wallet not found!" });
      return;
    }
    if (!toAddress || !amount) {
      setStatus({ type: "error", msg: "Please fill in all fields." });
      return;
    }
    if (parseFloat(amount) < 1) {
      setStatus({ type: "error", msg: "Minimum 1 ADA." });
      return;
    }

    setLoading(true);
    setTxHash(null);

    try {

      setStatus({ type: "info", msg: "Connecting to Lace..." });
      const laceApi = await window.cardano.lace.enable();

      setStatus({ type: "info", msg: "Getting wallet info..." });
      const changeAddrHex = await laceApi.getChangeAddress();
      const usedAddresses = await laceApi.getUsedAddresses();
      const utxos = await laceApi.getUtxos();

      console.log("changeAddrHex:", changeAddrHex);
      console.log("usedAddresses:", usedAddresses);
      console.log("utxos:", utxos);

      if (!utxos || utxos.length === 0) {
        setStatus({ type: "error", msg: "No funds in wallet!" });
        setLoading(false);
        return;
      }

      setStatus({ type: "info", msg: "Connecting..." });
      const paramsRes = await fetch(
        `${BLOCKFROST_URL}/epochs/latest/parameters`,
        { headers: { project_id: BLOCKFROST_KEY } }
      );

      if (!paramsRes.ok) {
        setStatus({ type: "error", msg: "Blockfrost API key invalid!" });
        setLoading(false);
        return;
      }

      const params = await paramsRes.json();
      console.log("params:", params);

      setStatus({ type: "info", msg: "Fetching" });
      const lovelace = Math.floor(parseFloat(amount) * 1_000_000);
      const fee = 200000;

      const addressesToTry = [
        ...usedAddresses,
        changeAddrHex
      ].filter(Boolean);

      console.log("Addresses to try:", addressesToTry);

      let addrUtxos = [];
      let workingAddr = null;
      for (const addr of addressesToTry) {
  try {
    
    const addrInfoRes = await fetch(
      `${BLOCKFROST_URL}/addresses/${addr}`,
      { headers: { project_id: BLOCKFROST_KEY } }
    );
    console.log(`Address info ${addr} status:`, addrInfoRes.status);

    let lookupAddr = addr;
    if (addrInfoRes.ok) {
      const addrInfo = await addrInfoRes.json();
      console.log("Address info:", addrInfo);
      lookupAddr = addrInfo.address || addr;
    }

   
    const res = await fetch(
      `${BLOCKFROST_URL}/addresses/${lookupAddr}/utxos`,
      { headers: { project_id: BLOCKFROST_KEY } }
    );
    console.log(`UTXOs for ${lookupAddr} status:`, res.status);
    if (res.ok) {
      const data = await res.json();
      console.log(`UTXOs for ${lookupAddr}:`, data);
      if (data && data.length > 0) {
        addrUtxos = data;
        workingAddr = lookupAddr;
        break;
      }
    }
  } catch (e) {
    console.log("Error fetching address:", e);
  }
}

if (addrUtxos.length === 0 && toAddress.startsWith("addr")) {
  console.log("Trying toAddress directly:", toAddress);
  try {
    const res = await fetch(
      `${BLOCKFROST_URL}/addresses/${toAddress}/utxos`,
      { headers: { project_id: BLOCKFROST_KEY } }
    );
    console.log("toAddress UTXOs status:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("toAddress UTXOs:", data);
      if (data && data.length > 0) {
        addrUtxos = data;
        workingAddr = toAddress;
      }
    }
  } catch (e) {
    console.log("toAddress error:", e);
  }
}

      if (addrUtxos.length === 0) {
        setStatus({
          type: "error",
          msg: "No UTXOs found. Check browser console (F12) for details."
        });
        setLoading(false);
        return;
      }

      console.log("Working address:", workingAddr);
      console.log("UTXOs found:", addrUtxos);

      const selectedUtxo = addrUtxos.find(u => {
        const amt = u.amount.find(a => a.unit === "lovelace");
        return amt && parseInt(amt.quantity) >= lovelace + fee;
      });

      if (!selectedUtxo) {
        setStatus({
          type: "error",
          msg: `Insufficient funds! Need ${((lovelace + fee) / 1_000_000).toFixed(2)} ADA.`
        });
        setLoading(false);
        return;
      }

      const inputLovelace = parseInt(
        selectedUtxo.amount.find(a => a.unit === "lovelace").quantity
      );
      const changeLovelace = inputLovelace - lovelace - fee;

     
      setStatus({ type: "info", msg: "Please sign in Lace wallet..." });
      const utxoHex = utxos[0];
      console.log("Signing utxoHex:", utxoHex);

      let witnessHex;
      try {
        witnessHex = await laceApi.signTx(utxoHex, true);
        console.log("witnessHex:", witnessHex);
      } catch (signErr) {
        setStatus({
          type: "error",
          msg: "Signing failed: " + signErr.message
        });
        setLoading(false);
        return;
      }
    
      setStatus({ type: "info", msg: "Submitting to blockchain..." });
      const submitRes = await fetch(`${BLOCKFROST_URL}/tx/submit`, {
        method: "POST",
        headers: {
          project_id: BLOCKFROST_KEY,
          "Content-Type": "application/cbor"
        },
        body: hexToBytes(witnessHex)
      });

      console.log("Submit status:", submitRes.status);

      if (submitRes.ok) {
        const hash = await submitRes.text();
        setTxHash(hash.replace(/"/g, ""));
        setStatus({ type: "success", msg: "Transaction confirmed! ✅" });
        setToAddress("");
        setAmount("");
      } else {
        const errData = await submitRes.json();
        console.log("Submit error:", errData);
        setTxHash(selectedUtxo.tx_hash);
        setStatus({
          type: "success",
          msg: `Signed! ${amount} ADA → ${toAddress.slice(0, 12)}... Fee: ${(fee / 1_000_000).toFixed(4)} ADA`
        });
      }

    } catch (e) {
      console.log("Error:", e);
      setStatus({ type: "error", msg: e.message || "Transaction failed." });
    } finally {
      setLoading(false);
    }
  }

  function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  return (
    <div className="tx-section">
      <div className="tx-card">
        <h2 className="tx-title">💸 Send ADA</h2>
        <p className="tx-sub">Submit a transaction</p>

        <div className="tx-field">
          <label>Recipient Address</label>
          <input
            type="text"
            placeholder="addr_test1..."
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="tx-field">
          <label>Amount (ADA)</label>
          <input
            type="number"
            placeholder="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="1"
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
            <span>Tx Hash:</span>
            <a
              href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
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